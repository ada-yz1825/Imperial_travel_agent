import json
import html
import math
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

from navigator_core import (
    APP_NAME,
    GROQ_API_URL,
    GOOGLE_TRAVEL_MODE,
    GOOGLE_PLACES_TEXT_SEARCH_API_URL,
    LLM_MAX_COMPLETION_TOKENS,
    TOGETHER_API_URL,
    TOGETHER_MAX_COMPLETION_TOKENS,
    apply_context_start,
    attach_route_geometry,
    build_navigation_answer,
    call_google_compute_route_variants,
    call_google_matrix_route,
    call_google_route_matrix,
    call_groq,
    call_ollama_stream,
    call_openai,
    call_together,
    check_llm_health,
    classify_agent_intent,
    current_llm_model,
    get_default_chat_model_id,
    get_google_maps_api_key,
    get_google_maps_browser_key,
    get_groq_api_key,
    get_groq_model,
    get_env_value,
    get_llm_provider,
    get_ollama_model,
    get_openai_api_key,
    get_openai_model,
    get_together_api_key,
    get_together_chat_models,
    get_together_model,
    get_weather_summary_together_model,
    imperial_shuttle_context,
    mode_label,
    navigation_mode_candidates,
    parse_navigation_query,
    public_place_payload,
    read_http_error,
    resolve_together_chat_model,
    resolve_location,
    resolve_route_request_contextual_places,
    strip_reasoning_text,
    valid_lat_lng,
)

OPENAI_CHAT_COMPLETIONS_API_URL = "https://api.openai.com/v1/chat/completions"
AGENT_TOOL_CALL_LIMIT = int(get_env_value("AGENT_TOOL_CALL_LIMIT") or "7")
AGENT_MIN_COMPLETION_TOKENS = int(get_env_value("AGENT_MIN_COMPLETION_TOKENS") or "4096")
AGENT_MAX_COMPLETION_TOKENS = max(
    AGENT_MIN_COMPLETION_TOKENS,
    int(get_env_value("AGENT_MAX_COMPLETION_TOKENS") or str(max(AGENT_MIN_COMPLETION_TOKENS, LLM_MAX_COMPLETION_TOKENS))),
)
AGENT_CONTINUATION_LIMIT = int(get_env_value("AGENT_CONTINUATION_LIMIT") or "2")
TFL_LINE_STATUS_MODES = "tube,overground,dlr,elizabeth-line,tram"
TFL_LINE_STATUS_URL = f"https://api.tfl.gov.uk/line/mode/{TFL_LINE_STATUS_MODES}/status"
TFL_STOP_POINT_MODES = "bus,tube,dlr,elizabeth-line,overground,tram,national-rail"
TFL_STOP_POINT_TYPES = "NaptanMetroStation,NaptanRailStation,NaptanPublicBusCoachTram"


def emit_mcp_progress(payload):
    message = {
        "jsonrpc": "2.0",
        "method": "notifications/progress",
        "params": payload,
    }
    sys.stdout.write(json.dumps(message, ensure_ascii=False) + "\n")
    sys.stdout.flush()


class MCPToolError(Exception):
    def __init__(self, message, status=500, payload=None):
        super().__init__(message)
        self.status = status
        self.payload = payload or {"error": message}


def format_model_http_error(raw_message):
    message = str(raw_message or "").strip()
    if message:
        try:
            data = json.loads(message)
            error = data.get("error") if isinstance(data, dict) else None
            if isinstance(error, dict) and error.get("message"):
                return f"模型服务返回错误：{error['message']}"
            if isinstance(error, str) and error:
                return f"模型服务返回错误：{error}"
        except json.JSONDecodeError:
            pass
        return f"模型服务返回错误：{message[:500]}"
    return "模型服务返回 HTTP 错误。"


def compact_json(value, limit=5000):
    text = json.dumps(value, ensure_ascii=False)
    if len(text) <= limit:
        return text
    return text[:limit] + "...[truncated]"


def agent_observation_payload(name, result):
    if name in {"navigate", "render_route_map"} and isinstance(result, dict):
        summary = {
            "origin": result.get("origin"),
            "destination": result.get("destination"),
            "originPlace": result.get("originPlace"),
            "destinationPlace": result.get("destinationPlace"),
            "waypoints": result.get("waypoints") or [],
            "waypointPlaces": result.get("waypointPlaces") or [],
            "destinationResolution": result.get("destinationResolution"),
            "routeLink": result.get("routeLink"),
            "relatedLinks": result.get("relatedLinks") or [],
            "recommended": summarize_route_option(result.get("recommended")),
            "alternatives": [summarize_route_option(route) for route in result.get("alternatives", [])],
            "modeComparison": summarize_mode_comparison(result.get("mapRoutes") or []),
            "publicTransportChoices": summarize_route_choices(result.get("mapRoutes") or [], preferred_mode="TRANSIT"),
            "routeChoices": summarize_route_choices(result.get("mapRoutes") or [], preferred_mode="TRANSIT"),
            "imperial_weekday_shuttle": result.get("imperial_weekday_shuttle"),
            "provider": result.get("provider"),
            "inlineMapRequested": bool(result.get("inlineMapRequested")),
        }
        if result.get("details"):
            summary["details"] = result.get("details")
        if result.get("lineStatuses"):
            summary["lineStatuses"] = result.get("lineStatuses")
        if result.get("lineStatusError"):
            summary["lineStatusError"] = result.get("lineStatusError")
        return summary
    if name == "route_matrix" and isinstance(result, dict):
        return result
    if name == "weather_current" and isinstance(result, dict):
        return result
    if name == "tfl_status" and isinstance(result, dict):
        return result
    return result


def summarize_mode_comparison(routes):
    if not isinstance(routes, list):
        return []
    best_by_mode = {}
    mode_order = {"TRANSIT": 0, "WALK": 1, "BICYCLE": 2, "TWO_WHEELER": 2, "DRIVE": 3}
    for route in routes:
        if not isinstance(route, dict):
            continue
        mode = str(route.get("mode") or "").upper()
        if not mode:
            continue
        current = best_by_mode.get(mode)
        if current is None or mode_comparison_sort_key(route) < mode_comparison_sort_key(current):
            best_by_mode[mode] = route
    summaries = []
    for mode, route in sorted(best_by_mode.items(), key=lambda item: mode_order.get(item[0], 99)):
        fare = route.get("fare") if isinstance(route.get("fare"), dict) else {}
        summary = {
            "mode": route.get("mode"),
            "modeLabel": route.get("modeLabel"),
            "durationMinutes": route.get("durationMinutes"),
            "distanceKm": route.get("distanceKm"),
            "fareDisplay": fare.get("display"),
        }
        if route.get("mode") == "TRANSIT":
            summary["lines"] = route_line_labels(route)
            summary["transferCount"] = max(0, len(route.get("transitSteps") or []) - 1)
        summaries.append({key: value for key, value in summary.items() if value not in (None, "", [])})
    return summaries


def mode_comparison_sort_key(route):
    return (
        route.get("durationMinutes") or 10**9,
        route.get("fare", {}).get("amountPence") if isinstance(route.get("fare"), dict) else 10**9,
    )


def summarize_route_choices(routes, limit=6, preferred_mode=None):
    if not isinstance(routes, list):
        return []
    preferred_mode = str(preferred_mode or "").upper()
    preferred_routes = [route for route in routes if str(route.get("mode") or "").upper() == preferred_mode] if preferred_mode else []
    source_routes = preferred_routes or routes
    choices = []
    seen = set()
    for route in diverse_route_options(source_routes):
        if not isinstance(route, dict):
            continue
        key = route_diversity_key(route)
        if key in seen:
            continue
        seen.add(key)
        fare = route.get("fare") if isinstance(route.get("fare"), dict) else {}
        choice = {
            "choiceId": len(choices) + 1,
            "mode": route.get("mode"),
            "modeLabel": route.get("modeLabel"),
            "durationMinutes": route.get("durationMinutes"),
            "distanceKm": route.get("distanceKm"),
            "fareDisplay": fare.get("display"),
            "lines": route_line_labels(route),
            "routeVariantIndex": route.get("routeVariantIndex"),
            "routeVariantCount": route.get("routeVariantCount"),
            "transferCount": max(0, len(route.get("transitSteps") or []) - 1) if route.get("mode") == "TRANSIT" else 0,
        }
        choice = {key: value for key, value in choice.items() if value not in (None, "", [])}
        step_summary = summarize_transit_steps_for_choice(route.get("transitSteps") or [])
        if step_summary:
            choice["transitStepSummary"] = step_summary
        walk_minutes, walk_distance_text = route_walking_summary(route)
        if walk_minutes is not None:
            choice["walkingMinutesApprox"] = walk_minutes
        if walk_distance_text:
            choice["walkingDistanceText"] = walk_distance_text
        choices.append(choice)
        if len(choices) >= limit:
            break
    return choices


def route_diversity_key(route):
    mode = str(route.get("mode") or "").upper()
    line_key = tuple(label.lower() for label in route_line_labels(route))
    stop_pairs = []
    for step in route.get("transitSteps") or []:
        if not isinstance(step, dict):
            continue
        line = str(step.get("lineShortName") or step.get("lineName") or step.get("vehicleType") or "").lower()
        departure = normalize_route_choice_text(step.get("departureStop"))
        arrival = normalize_route_choice_text(step.get("arrivalStop"))
        stop_pairs.append((line, departure, arrival))
    if stop_pairs:
        return mode, tuple(stop_pairs)
    if line_key:
        return mode, line_key
    return mode, route.get("durationMinutes"), route.get("distanceKm")


def normalize_route_choice_text(value):
    text = re.sub(r"\s+", " ", str(value or "").strip().lower())
    text = re.sub(r"\s*\([^)]*\)", "", text)
    text = re.sub(r"\b(stop|station)\b", "", text)
    return text.strip(" ,")


def diverse_route_options(routes, limit=None):
    if not isinstance(routes, list):
        return []
    ordered = [route for route in routes if isinstance(route, dict)]
    selected = []
    seen = set()
    for route in ordered:
        key = route_diversity_key(route)
        if key in seen:
            continue
        seen.add(key)
        selected.append(route)
        if limit and len(selected) >= limit:
            break
    return selected


def route_line_labels(route):
    labels = []
    for line in route.get("transitLines") or []:
        if not isinstance(line, dict):
            continue
        label = line.get("shortName") or line.get("name")
        if label and label not in labels:
            labels.append(label)
    return labels


def summarize_transit_steps_for_choice(steps, limit=5):
    summary = []
    for step in steps[:limit]:
        if not isinstance(step, dict):
            continue
        line = step.get("lineShortName") or step.get("lineName") or step.get("vehicleType")
        item = {
            "line": line,
            "vehicleType": step.get("vehicleType"),
            "from": step.get("departureStop"),
            "to": step.get("arrivalStop"),
            "durationText": step.get("durationText"),
        }
        summary.append({key: value for key, value in item.items() if value})
    return summary


def route_walking_summary(route):
    walk_seconds = 0
    walk_distance_texts = []
    for step in route.get("routeSegments") or []:
        if not isinstance(step, dict):
            continue
        if str(step.get("travelMode") or "").upper() != "WALK":
            continue
        duration = str(step.get("duration") or "")
        match = re.fullmatch(r"(\d+(?:\.\d+)?)s", duration)
        if match:
            walk_seconds += float(match.group(1))
        if step.get("distanceText"):
            walk_distance_texts.append(str(step["distanceText"]))
    if not walk_seconds and not walk_distance_texts:
        return None, ""
    walk_minutes = max(1, round(walk_seconds / 60)) if walk_seconds else None
    return walk_minutes, ", ".join(walk_distance_texts[:3])


def summarize_route_option(route):
    if not isinstance(route, dict):
        return route
    summary = {
        "mode": route.get("mode"),
        "modeLabel": route.get("modeLabel"),
        "durationMinutes": route.get("durationMinutes"),
        "distanceKm": route.get("distanceKm"),
        "description": route.get("description"),
        "condition": route.get("condition"),
    }
    if route.get("fare"):
        summary["fare"] = route.get("fare")
    if route.get("fareBreakdown"):
        summary["fareBreakdown"] = route.get("fareBreakdown")
    if route.get("transitLines"):
        summary["transitLines"] = route.get("transitLines")
    if route.get("transitSteps"):
        summary["transitStepSummary"] = summarize_transit_steps_for_choice(route.get("transitSteps") or [])
    return summary


def google_maps_travel_mode(mode):
    text = str(mode or "").strip().upper()
    return {
        "TRANSIT": "transit",
        "WALK": "walking",
        "BICYCLE": "bicycling",
        "TWO_WHEELER": "bicycling",
        "DRIVE": "driving",
        "DRIVING": "driving",
    }.get(text, "walking")


def google_maps_route_link(origin_place, destination_place, route=None, waypoint_places=None):
    if not valid_lat_lng(origin_place) or not valid_lat_lng(destination_place):
        return ""
    params = {
        "api": "1",
        "origin": f"{origin_place['lat']},{origin_place['lng']}",
        "destination": f"{destination_place['lat']},{destination_place['lng']}",
        "travelmode": google_maps_travel_mode((route or {}).get("mode")),
    }
    valid_waypoints = [item for item in (waypoint_places or []) if valid_lat_lng(item)]
    if valid_waypoints:
        params["waypoints"] = "|".join(f"{item['lat']},{item['lng']}" for item in valid_waypoints)
    params = urllib.parse.urlencode(params)
    return f"https://www.google.com/maps/dir/?{params}"


def google_maps_place_link(place):
    if not isinstance(place, dict):
        return ""
    if place.get("googleMapsUri"):
        return str(place.get("googleMapsUri") or "").strip()
    name = str(place.get("name") or "").strip()
    if valid_lat_lng(place):
        query = f"{name} {place['lat']},{place['lng']}".strip()
    else:
        query = name
    if not query:
        return ""
    return f"https://www.google.com/maps/search/?{urllib.parse.urlencode({'api': '1', 'query': query})}"


def safe_external_url(value):
    url = str(value or "").strip()
    if not re.match(r"^https://", url, flags=re.IGNORECASE):
        return ""
    return url


def fetch_google_place_direct_info(place):
    if not isinstance(place, dict):
        return {}
    name = str(place.get("name") or "").strip()
    if not name:
        return {}
    api_key = get_google_maps_api_key()
    if not api_key:
        return {}
    body = {
        "textQuery": name,
        "languageCode": "en",
        "maxResultCount": 3,
    }
    if valid_lat_lng(place):
        body["locationBias"] = {
            "circle": {
                "center": {"latitude": place["lat"], "longitude": place["lng"]},
                "radius": 1000,
            }
        }
    request = urllib.request.Request(
        GOOGLE_PLACES_TEXT_SEARCH_API_URL,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "places.displayName,places.websiteUri,places.googleMapsUri,places.types,places.businessStatus",
            "User-Agent": APP_NAME,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8", errors="replace"))
    except Exception:
        return {}
    places = data.get("places") or []
    if not places:
        return {}
    selected = places[0] if isinstance(places[0], dict) else {}
    return {
        "websiteUri": safe_external_url(selected.get("websiteUri")),
        "googleMapsUri": safe_external_url(selected.get("googleMapsUri")),
        "types": selected.get("types") if isinstance(selected.get("types"), list) else [],
        "businessStatus": selected.get("businessStatus") or "",
    }


def merge_place_type_flags(flags, place_info):
    types = {str(value or "").lower() for value in (place_info or {}).get("types") or []}
    if types.intersection({"museum", "art_gallery", "tourist_attraction", "amusement_park", "zoo", "aquarium", "park"}):
        flags["attraction"] = True
    if types.intersection({"stadium", "performing_arts_theater", "movie_theater", "event_venue"}):
        flags["venue"] = True
    if types.intersection({"restaurant", "cafe", "bar", "pub"}):
        flags["food"] = True
    if types.intersection({"lodging", "hotel", "motel", "hostel"}):
        flags["hotel"] = True
    if types.intersection({"airport"}):
        flags["airport"] = True
    if types.intersection({"train_station"}):
        flags["railStation"] = True
        flags["station"] = True
    return flags


def compact_link_title(value, fallback="Link"):
    text = re.sub(r"\s+", " ", str(value or "").strip())
    return text[:80] or fallback


def add_related_link(links, link_id, title, url, category, source, description="", priority=50):
    if not url:
        return
    seen = {item.get("url") for item in links if isinstance(item, dict)}
    if url in seen:
        return
    item = {
        "id": link_id,
        "title": compact_link_title(title),
        "url": url,
        "category": category,
        "source": source,
        "priority": priority,
    }
    if description:
        item["description"] = compact_link_title(description, "")
    links.append(item)


def destination_keyword_flags(name):
    text = str(name or "").lower()
    attraction_terms = [
        "museum",
        "gallery",
        "palace",
        "castle",
        "tower",
        "zoo",
        "aquarium",
        "garden",
        "park",
        "cathedral",
        "abbey",
        "theatre",
        "theater",
        "stadium",
        "arena",
        "exhibition",
        "attraction",
        "景点",
        "博物馆",
        "美术馆",
        "画廊",
        "宫",
        "城堡",
        "塔",
        "动物园",
        "水族馆",
        "剧院",
        "体育馆",
        "展览",
    ]
    station_terms = [
        "station",
        "火车站",
        "车站",
    ]
    rail_station_terms = [
        "railway station",
        "train station",
        "rail station",
        "national rail",
        "火车站",
        "铁路站",
    ]
    uk_rail_terminal_terms = [
        "paddington",
        "king's cross",
        "kings cross",
        "st pancras",
        "euston",
        "victoria station",
        "waterloo",
        "london bridge",
        "liverpool street",
        "marylebone",
        "charing cross",
        "cannon street",
        "fenchurch street",
        "blackfriars",
        "clapham junction",
    ]
    airport_terms = ["airport", "terminal", "机场", "航站楼"]
    venue_terms = ["theatre", "theater", "stadium", "arena", "cinema", "concert", "venue", "剧院", "影院", "场馆", "演唱会"]
    food_terms = ["restaurant", "cafe", "café", "bar", "pub", "餐厅", "咖啡", "酒吧"]
    hotel_terms = ["hotel", "hostel", "inn", "accommodation", "酒店", "宾馆", "旅馆", "住宿"]
    return {
        "attraction": any(term in text for term in attraction_terms),
        "station": any(term in text for term in station_terms),
        "railStation": any(term in text for term in rail_station_terms) or any(term in text for term in uk_rail_terminal_terms),
        "airport": any(term in text for term in airport_terms),
        "venue": any(term in text for term in venue_terms),
        "food": any(term in text for term in food_terms),
        "hotel": any(term in text for term in hotel_terms),
    }


def route_has_national_rail(route):
    if not isinstance(route, dict):
        return False
    for stop in route.get("routeStops") or []:
        if not isinstance(stop, dict):
            continue
        modes = [str(value or "").lower() for value in stop.get("servedModes") or []]
        if "national-rail" in modes:
            return True
    rail_terms = ("national rail", "heavy_rail", "commuter_train", "high_speed_train", "intercity", "great western", "southern", "thameslink", "lner", "avanti", "铁路", "火车")
    excluded_london_terms = ("overground", "elizabeth", "underground", "tube", "dlr", "tram", "subway")
    for step in route.get("transitSteps") or []:
        if not isinstance(step, dict):
            continue
        values = [
            step.get("vehicleType"),
            step.get("lineName"),
            step.get("lineShortName"),
            step.get("agencyName"),
            step.get("departureStop"),
            step.get("arrivalStop"),
        ]
        text = " ".join(str(value or "").lower() for value in values)
        if any(term in text for term in rail_terms) and not any(term in text for term in excluded_london_terms):
            return True
    return False


def is_london_coordinate(place):
    if not valid_lat_lng(place):
        return False
    return 51.28 <= place["lat"] <= 51.70 and -0.55 <= place["lng"] <= 0.35


def station_search_name(place):
    name = re.sub(r"\s+", " ", str((place or {}).get("name") or "").strip())
    if not name:
        return ""
    cleaned = re.sub(r"\b(?:railway|train|rail)\s+station\b", "station", name, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", cleaned).strip()


def route_related_links(origin_place, destination_place, route=None, waypoint_places=None):
    links = []
    destination_name = str((destination_place or {}).get("name") or "").strip()
    flags = destination_keyword_flags(destination_name)
    if flags["station"] and valid_lat_lng(destination_place) and not is_london_coordinate(destination_place):
        flags["railStation"] = True
    direct_info = {}
    official_website = safe_external_url((destination_place or {}).get("websiteUri"))
    google_maps_uri = safe_external_url((destination_place or {}).get("googleMapsUri"))
    if destination_name and (not official_website or not google_maps_uri):
        direct_info = fetch_google_place_direct_info(destination_place)
        official_website = official_website or direct_info.get("websiteUri") or ""
        google_maps_uri = google_maps_uri or direct_info.get("googleMapsUri") or ""
        flags = merge_place_type_flags(flags, direct_info)
    destination_link_place = dict(destination_place or {})
    if google_maps_uri:
        destination_link_place["googleMapsUri"] = google_maps_uri

    add_related_link(
        links,
        "destination_maps",
        "Open destination in Google Maps",
        google_maps_place_link(destination_link_place),
        "destination",
        "google_maps_place",
        "Destination details, photos, opening hours, and nearby context.",
        18,
    )
    if official_website and (flags["attraction"] or flags["venue"]):
        add_related_link(
            links,
            "destination_tickets",
            "Check tickets on the destination website",
            official_website,
            "tickets",
            "google_places_website",
            "Open the destination website and check its tickets, visit, or booking section.",
            8,
        )
    if official_website and flags["venue"]:
        add_related_link(
            links,
            "destination_events",
            "Check events and availability",
            official_website,
            "tickets",
            "google_places_website",
            "Open the venue website for timed entry, performances, events, or availability.",
            16,
        )

    if destination_name and flags["food"]:
        add_related_link(
            links,
            "destination_reservations",
            "Book a table",
            official_website or "https://www.opentable.co.uk/",
            "reservations",
            "destination_website" if official_website else "opentable",
            "Open the restaurant website when available, otherwise use OpenTable for reservation search.",
            17,
        )

    if destination_name and flags["hotel"]:
        add_related_link(
            links,
            "destination_booking",
            "Check hotel booking options",
            official_website or "https://www.booking.com/",
            "booking",
            "destination_website" if official_website else "booking_com",
            "Open the accommodation website when available, otherwise use Booking.com.",
            17,
        )

    if official_website:
        add_related_link(
            links,
            "destination_official",
            "Open the destination website",
            official_website,
            "destination",
            "google_places_website",
            "Direct website from Google Places; use it for opening hours, visitor information, tickets, or booking details.",
            12,
        )

    needs_rail = bool(flags["railStation"] or route_has_national_rail(route))
    if needs_rail:
        add_related_link(
            links,
            "national_rail",
            "National Rail tickets and live services",
            "https://www.nationalrail.co.uk/journey-planner/",
            "rail_tickets",
            "national_rail",
            "Use for UK train times, service details, fares, and retailer handoff.",
            8,
        )
        add_related_link(
            links,
            "trainline",
            "Trainline train tickets",
            "https://www.thetrainline.com/",
            "rail_tickets",
            "trainline",
            "Alternative retailer for UK train tickets.",
            22,
        )
        if flags["railStation"]:
            add_related_link(
                links,
                "station_info",
                "Station information",
                "https://www.nationalrail.co.uk/stations/",
                "station_info",
                "national_rail",
                f"Facilities, accessibility, and live information for stations such as {station_search_name(destination_place)}.",
                28,
            )

    if official_website and flags["airport"]:
        add_related_link(
            links,
            "airport_flights",
            "Check airport live departures",
            official_website,
            "airport",
            "google_places_website",
            "Open the airport website for live departures and terminal information.",
            20,
        )

    links.sort(key=lambda item: (item.get("priority", 99), item.get("title", "")))
    return links[:6]


def agent_tool_schema_definitions():
    return [
        {
            "type": "function",
            "function": {
                "name": "web_search",
                "description": "Search the web for encyclopedia-style or public factual questions, returning concise sourced snippets and links.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The user's factual or encyclopedia-style search query.",
                        },
                        "language": {
                            "type": "string",
                            "description": "Preferred language code such as en or zh. Infer from the user's query when omitted.",
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Maximum number of results to return, from 1 to 5.",
                        },
                    },
                    "required": ["query"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "navigate",
                "description": "Calculate live travel routes, durations, distances, route geometry, waypoints/via stops, nearest-place destinations such as nearest KFC, and destination context using Google Routes and Places.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The user's route request, including origin/destination/mode, via/waypoint constraints, or nearest/nearby destination wording when present.",
                        },
                        "contextStart": {
                            "type": "object",
                            "description": "Selected browser start point with name, lat, lng. Use when the user gives only a destination.",
                        },
                        "history": {"type": "array"},
                    },
                    "required": ["query"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "render_route_map",
                "description": "Prepare the inline route-map payload for the browser after a navigation request, including route geometry, waypoints/via stops, and nearest-place destinations. Use this for directions so the browser can embed the map with the answer.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The user's route request, including origin/destination/mode, via/waypoint constraints, or nearest/nearby destination wording when present.",
                        },
                        "contextStart": {
                            "type": "object",
                            "description": "Selected browser start point with name, lat, lng. Use when the user gives only a destination.",
                        },
                        "history": {"type": "array"},
                    },
                    "required": ["query"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "route_matrix",
                "description": "Get live Google Routes travel estimates from one start point to multiple destinations.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "start": {"type": "object", "description": "Start point with name, lat, lng."},
                        "destinations": {
                            "type": "array",
                            "description": "Destination places with name, lat, lng.",
                            "items": {"type": "object"},
                        },
                    },
                    "required": ["start", "destinations"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "fare_quote",
                "description": "Return UK public-transport fare information for a route when available. Use existing routeSummary fare data first; future providers can supplement TfL or National Rail fares.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "originPlace": {"type": "object", "description": "Route origin with lat and lng."},
                        "destinationPlace": {"type": "object", "description": "Route destination with lat and lng."},
                        "waypointPlaces": {"type": "array", "items": {"type": "object"}},
                        "departureTime": {"type": "string"},
                        "transitSteps": {"type": "array", "items": {"type": "object"}},
                        "routeSummary": {"type": "object", "description": "A route object, ideally from navigate or render_route_map."},
                    },
                    "required": ["originPlace", "destinationPlace", "routeSummary"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "weather_current",
                "description": "Look up current weather at a start point, destination, or named place using Google Weather API.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "object",
                            "description": "Location with optional name/label and either lat/lng coordinates or a place/query string.",
                            "properties": {
                                "name": {"type": "string"},
                                "label": {"type": "string"},
                                "query": {"type": "string"},
                                "place": {"type": "string"},
                                "lat": {"type": "number"},
                                "lng": {"type": "number"},
                            },
                        }
                    },
                    "required": ["location"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "tfl_status",
                "description": "Look up live TfL line status. Use after navigate when a transit route includes TfL line names, or when the user asks about delays/status.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "lines": {
                            "type": "array",
                            "description": "Optional TfL line names from navigate, such as Central line or Elizabeth line.",
                            "items": {"type": "string"},
                        }
                    },
                },
            },
        },
    ]


def agent_tool_names():
    return [tool["function"]["name"] for tool in agent_tool_schema_definitions()]


def agent_system_prompt():
    return (
        "You are Imperial Travel Agent. The browser gives you the user's question, selected start point, "
        "candidate destinations, and recent chat history. Decide for yourself whether a tool is needed. "
        "Use tools when they materially improve factual accuracy: web_search for encyclopedia-style or public factual questions, "
        "navigate for routes/directions, route_matrix for live travel estimates to destinations, weather_current for current weather, "
        "fare_quote for UK public-transport fares when a route exists but fare details are missing or the user specifically asks about price, "
        "and tfl_status for live London line disruption/status checks. "
        "You may call multiple tools in sequence, observe the result, then decide whether another tool is needed. "
        "If navigate returns transitLines and the user asks for route advice, delay impact, or whether it is a good time to travel, "
        "call tfl_status with the provided statusQuery values, or the shortName for bus routes, before the final answer. "
        "For navigation or directions requests, call render_route_map after navigate so the browser can embed the route map with your answer. If navigate succeeds and returns a usable route, you should normally call render_route_map in the same turn unless there is a concrete tool failure. "
        "When you have called render_route_map, treat the embedded route map as part of your response context and refer to it only when that feels natural for the current answer, "
        "instead of ignoring it or describing it like a separate system widget. When referring to the embedded map, keep the wording mode-neutral and do not label it as a driving, walking, cycling, or transit map unless the user explicitly asks for a specific mode. If the tool result includes routeLink, you may include a short natural Markdown link to Google Maps "
        "as an optional next step. Use the exact routeLink value returned by the tool; do not construct, shorten, re-encode, wrap, or partially copy the URL. If you cannot include the exact full URL, omit the Markdown link from the text because the browser has its own Google Maps action. Make it clear, in wording that fits the surrounding answer, that clicking the link opens this route directly in Google Maps so the user can check real-time route updates or continue navigation. Do not describe this purpose as checking live traffic or traffic conditions. Do not force a fixed phrase or make the whole answer revolve around the link. "
        "When you call weather_current and the tool result includes weatherLink, you should usually include one short, natural Markdown link so the user can open Google to check weather details and forecast data. Use only the provided weatherLink for this purpose; never expose or invent weather.googleapis.com API URLs or API keys. Keep the link phrasing concise and varied so it fits the surrounding answer. "
        "When route results include fare, treat fare.display as the total fare and make it the primary price information in your answer. If fareBreakdown exists, you may briefly mention per-leg prices after the total, but do not let segment prices dominate. Never invent fares; if fare is absent, do not mention price unless the user explicitly asked, and then say it was not available from the tools. "
        "When navigate or render_route_map returns relatedLinks, you may include a small number of the most useful links naturally near the end of the answer. Prefer direct destination ticket/website links for attractions or venues, National Rail or Trainline links when the destination is a station or a public-transport route includes National Rail, reservation links for restaurants, booking links for hotels, airport official links for airports, and Google Maps destination links for place details. Use the exact URLs from relatedLinks; do not invent ticket links, booking links, or deep checkout URLs. Explain the purpose briefly, for example: '如果需要购买火车票，可以点击：...' or 'For tickets, use: ...'. If no relevant relatedLinks are returned, do not add this section. "
        "Keep transport-mode comparison separate from public-transport route comparison. Use modeComparison only to compare broad modes such as public transport, walking, cycling, and driving. Use publicTransportChoices or routeChoices only inside a public-transport section to compare specific bus, Tube, rail, tram, or mixed transit options. Do not mix driving or cycling into the public-transport route-choice analysis. When publicTransportChoices are present, compare them according to the user's stated priority, such as fastest, cheapest, fewest transfers, least walking, accessibility, weather comfort, or overall convenience. If the user gives no priority, recommend the best overall public-transport trade-off using duration, total fare, transferCount, walkingMinutesApprox, and line simplicity. Refer to choices by their actual lines, time, fare, and trade-offs, not by hidden IDs alone. "
        "If you want the interactive route map to appear at a specific point in your answer, insert the standalone token [[ROUTE_MAP]] exactly where it should appear; the browser will replace that token with the embedded map. When the answer includes route advice plus other follow-up material such as weather, destination context, travel tips, or service reminders, it is usually more natural to place [[ROUTE_MAP]] soon after the main route explanation and before those secondary details, unless the context strongly suggests another position. A short context-setting phrase or sentence often helps the map feel naturally integrated with the surrounding explanation, but it is not mandatory and should vary with the situation. If you add such a lead-in, keep it brief, mode-neutral, and phrased in a fresh way that matches the nearby text rather than repeating a stock formula across answers. If you do not include [[ROUTE_MAP]], the browser may place the map after the main text. Do not say above or below unless your wording matches where you place [[ROUTE_MAP]]. Avoid repeating the same stock sentence about the map across answers. "
        "Imperial runs a weekday campus shuttle connecting South Kensington, White City, and Hammersmith. "
        "Only mention the shuttle when both the origin and destination are near those campuses and the tool context indicates it applies; when it does, mention it briefly as an option and include this Markdown link: "
        "[Imperial shuttle](https://www.imperial.ac.uk/admin-services/property/travel/shuttle-bus/). "
        "Only mention specific line names, stops, and statuses that tools provide. "
        "If navigate does not provide transitLines, say the route tool did not provide specific line details instead of guessing. "
        "When using web_search, ground the answer in the returned sources and include a concise Markdown source link when useful. "
        "Only discuss candidate study-space recommendations, libraries, comfort scores, or ranked places when the current user question explicitly asks for study spaces, libraries, places to work, quiet places, or similar study planning. "
        "For greetings or ordinary chat, do not proactively recommend libraries or study spaces even if location context is available. "
        "If no tool is needed, answer directly. Match the user's language. Use at most one blank line between "
        "distinct paragraphs or before and after lists, and avoid consecutive blank lines. For short answers, prefer "
        "no blank lines unless a section break is genuinely helpful. When comparing multiple transport modes, prefer "
        "a Markdown table with columns such as mode, time, distance, and note, instead of a plain paragraph list. "
        "Do not insert empty Markdown table placeholder rows such as '| | |' between headings and content. "
        "Use a small number of light emoji when they improve readability or make the answer feel more lively, but do "
        "not overuse them. "
        "Do not reveal hidden reasoning, scratchpad, analysis, or <think> tags. Keep answers concise but useful."
    )


def agent_user_prompt(payload):
    question = payload.get("question", "")
    safe_payload = {
        "question": question,
        "contextStart": payload.get("contextStart"),
        "context": payload.get("context"),
        "ranked": payload.get("ranked", []) if is_study_recommendation_request(question) else [],
        "history": payload.get("history", [])[-6:],
    }
    return (
        "Handle this browser request. Use the provided selected start point as contextStart when a route/weather request "
        "has no explicit origin. If the user asks about weather at the destination after a route tool call, use the "
        "destinationPlace from the route result. For navigation answers, keep the route explanation primary, and weave any embedded map or optional route link in as a natural supporting detail when available. When mentioning the embedded map, use neutral wording rather than naming a specific transport mode unless the user asked for one. After a successful navigate call, you should normally also call render_route_map so the route is embedded with the answer. If render_route_map succeeds, place [[ROUTE_MAP]] where it fits naturally if you want the map embedded at a specific point. First compare broad transport modes using modeComparison when useful. Then, in a separate public-transport discussion, compare publicTransportChoices/routeChoices according to the user's priority; if no priority is stated, recommend the best public-transport trade-off across time, total fare, transfers, walking, and simplicity. Do not include driving or cycling inside that public-transport route-choice comparison. When the answer also includes weather, destination introduction, travel tips, or other extra material, prefer placing [[ROUTE_MAP]] right after the route explanation before moving on, unless another order reads more naturally. If route results include fare, prioritize the total fare.display in the answer; mention fareBreakdown only as a brief supporting detail when present. If relatedLinks are present, pick only the most context-relevant direct links: destination ticket/website links for attractions and venues, National Rail or Trainline for train journeys/stations, reservation links for restaurants, booking links for hotels, airport live-departure links for airports, and Google Maps destination links when useful. Use exact URLs from relatedLinks; do not make up ticket pages or checkout deep links. Add a brief explanation before each important link, such as '如果需要购买火车票，可以点击：...' rather than dumping bare links. If you include routeLink, use the exact full routeLink value from the tool in Markdown and do not modify or manually compose the URL; naturally explain that clicking it opens this route directly in Google Maps for real-time route updates or continued navigation; do not call this live traffic information. If weather_current returns weatherLink, use that exact link if you include a Google weather or forecast link; do not write raw Weather API URLs or any API key-bearing URL. Choose your own concise wording to fit the answer rather than using a stock sentence. A brief transition into the map is often helpful, but it should be optional, concise, and adapted to the exact context instead of sounding templated.\n"
        f"{compact_json(safe_payload, limit=6500)}"
    )


def is_study_recommendation_request(question):
    text = str(question or "").lower()
    study_terms = [
        "study",
        "studying",
        "library",
        "libraries",
        "workspace",
        "work space",
        "study space",
        "seat",
        "quiet",
        "focus",
        "revise",
        "revision",
        "gostudy",
        "abdus salam",
        "学习",
        "自习",
        "复习",
        "图书馆",
        "座位",
        "安静",
        "学习空间",
        "学习地点",
    ]
    return any(term in text for term in study_terms)


def call_tool_choice_model(messages, tools, provider_override=None, model_override=None):
    provider = (provider_override or get_llm_provider() or "").lower()
    if provider == "groq":
        api_key = get_groq_api_key()
        if not api_key:
            raise MCPToolError("未配置 GROQ_API_KEY。", status=500, payload={"error": "未配置 GROQ_API_KEY。"})
        return call_chat_completion_tools(
            GROQ_API_URL,
            api_key,
            get_groq_model(),
            messages,
            tools,
            provider="groq",
        )
    if provider == "together":
        api_key = get_together_api_key()
        if not api_key:
            raise MCPToolError("未配置 TOGETHER_API_KEY。", status=500, payload={"error": "未配置 TOGETHER_API_KEY。"})
        return call_chat_completion_tools(
            TOGETHER_API_URL,
            api_key,
            current_llm_model("together", model_override or get_together_model()),
            messages,
            tools,
            provider="together",
        )
    if provider == "openai":
        api_key = get_openai_api_key()
        if not api_key:
            raise MCPToolError("未配置 OPENAI_API_KEY。", status=500, payload={"error": "未配置 OPENAI_API_KEY。"})
        return call_chat_completion_tools(
            OPENAI_CHAT_COMPLETIONS_API_URL,
            api_key,
            get_openai_model(),
            messages,
            tools,
            provider="openai",
        )
    return None


def call_chat_completion_tools(url, api_key, model, messages, tools, provider):
    body = {
        "model": model,
        "messages": messages,
        "tools": tools,
        "tool_choice": "auto",
    }
    if provider == "groq":
        body["temperature"] = 0.2
        body["max_completion_tokens"] = AGENT_MAX_COMPLETION_TOKENS
    elif provider == "together":
        body["temperature"] = 0.2
        body["max_tokens"] = AGENT_MAX_COMPLETION_TOKENS
    else:
        body["max_completion_tokens"] = AGENT_MAX_COMPLETION_TOKENS

    request = urllib.request.Request(
        url,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": f"{APP_NAME}/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        data = json.loads(response.read().decode("utf-8", errors="replace"))
    choices = data.get("choices") or []
    if not choices:
        return {"role": "assistant", "content": "模型没有返回文本结果。"}
    choice = choices[0]
    message = choice.get("message") or {"role": "assistant", "content": ""}
    if isinstance(message, dict):
        message["_finishReason"] = choice.get("finish_reason") or choice.get("finishReason") or ""
    return message


def call_chat_completion_text_only(url, api_key, model, messages, provider, max_tokens=None):
    body = {
        "model": model,
        "messages": messages,
    }
    if provider in {"groq", "together"}:
        body["temperature"] = 0.2
    if provider == "groq":
        body["max_completion_tokens"] = max_tokens or AGENT_MAX_COMPLETION_TOKENS
    elif provider == "together":
        body["max_tokens"] = max_tokens or AGENT_MAX_COMPLETION_TOKENS
    else:
        body["max_completion_tokens"] = max_tokens or AGENT_MAX_COMPLETION_TOKENS

    request = urllib.request.Request(
        url,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": f"{APP_NAME}/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        data = json.loads(response.read().decode("utf-8", errors="replace"))
    choices = data.get("choices") or []
    if not choices:
        return "", ""
    choice = choices[0]
    message = choice.get("message") or {}
    return strip_reasoning_text(message.get("content") or ""), choice.get("finish_reason") or choice.get("finishReason") or ""


def agent_text_endpoint(provider):
    if provider == "groq":
        return GROQ_API_URL, get_groq_api_key()
    if provider == "together":
        return TOGETHER_API_URL, get_together_api_key()
    if provider == "openai":
        return OPENAI_CHAT_COMPLETIONS_API_URL, get_openai_api_key()
    return "", ""


def continue_truncated_agent_answer(messages, partial_answer, provider, model):
    answer = str(partial_answer or "")
    if not answer:
        return answer
    url, api_key = agent_text_endpoint(provider)
    if not url or not api_key:
        return answer
    finish_reason = "length"
    continuation_messages = [
        *messages,
        {"role": "assistant", "content": answer},
    ]
    for _ in range(max(0, AGENT_CONTINUATION_LIMIT)):
        if str(finish_reason or "").lower() not in {"length", "max_tokens", "max_completion_tokens"}:
            break
        continuation_messages.append(
            {
                "role": "user",
                "content": (
                    "Continue the previous answer exactly from where it stopped. "
                    "Do not restart, summarize, repeat earlier paragraphs, or add a new heading unless the previous answer was already starting one. "
                    "Finish the response naturally."
                ),
            }
        )
        continuation, finish_reason = call_chat_completion_text_only(
            url,
            api_key,
            model,
            continuation_messages,
            provider,
            max_tokens=max(1200, AGENT_MAX_COMPLETION_TOKENS // 2),
        )
        continuation = strip_reasoning_text(continuation).strip()
        if not continuation:
            break
        answer = merge_answer_continuation(answer, continuation)
        continuation_messages.append({"role": "assistant", "content": continuation})
    return answer


def merge_answer_continuation(answer, continuation):
    base = str(answer or "").rstrip()
    extra = str(continuation or "").lstrip()
    if not base:
        return extra
    if not extra:
        return base
    if base.endswith(("-", "–", "—", "/", "(", "[", "£", "=", "?", "&", "%", ",", ".")):
        return f"{base}{extra}"
    if re.search(r"\[[^\]]*\]\([^)]*$", base) or re.search(r"https?://\S*$", base):
        return f"{base}{extra}"
    return f"{base}\n{extra}"


def parse_tool_arguments(raw_arguments):
    if isinstance(raw_arguments, dict):
        return raw_arguments
    if not raw_arguments:
        return {}
    try:
        value = json.loads(raw_arguments)
        return value if isinstance(value, dict) else {}
    except json.JSONDecodeError:
        return {}


def normalize_agent_tool_arguments(name, arguments, payload):
    normalized = dict(arguments or {})
    if name == "web_search":
        normalized.setdefault("query", payload.get("question", ""))
        normalized.setdefault("limit", 3)
    elif name == "navigate":
        normalized.setdefault("query", payload.get("question", ""))
        normalized.setdefault("contextStart", payload.get("contextStart"))
        normalized.setdefault("history", payload.get("history", [])[-6:])
        normalized["_agentTool"] = True
    elif name == "render_route_map":
        normalized.setdefault("query", payload.get("question", ""))
        normalized.setdefault("contextStart", payload.get("contextStart"))
        normalized.setdefault("history", payload.get("history", [])[-6:])
        normalized["_agentTool"] = True
        normalized["_renderRouteMap"] = True
    elif name == "route_matrix":
        context_start = payload.get("contextStart") or {}
        context = payload.get("context") or {}
        start_coords = context.get("startCoordinates") if isinstance(context, dict) else None
        normalized.setdefault(
            "start",
            {
                "name": context_start.get("name") or context_start.get("label") or context.get("startPoint") or "Selected start point",
                "lat": context_start.get("lat") or (start_coords or {}).get("lat"),
                "lng": context_start.get("lng") or (start_coords or {}).get("lng"),
            },
        )
        if not normalized.get("destinations"):
            normalized["destinations"] = [
                {"name": place.get("name"), "lat": place.get("lat"), "lng": place.get("lng")}
                for place in payload.get("ranked", [])
                if valid_lat_lng(place)
            ]
    elif name == "weather_current":
        location = normalized.get("location")
        if not isinstance(location, dict):
            location = {}
        if not location:
            context_start = payload.get("contextStart") or {}
            if valid_lat_lng(context_start):
                location = {
                    "name": context_start.get("name") or context_start.get("label") or "Selected start point",
                    "lat": context_start["lat"],
                    "lng": context_start["lng"],
                }
        normalized["location"] = location
    elif name == "tfl_status":
        lines = normalized.get("lines")
        if isinstance(lines, str):
            normalized["lines"] = [lines]
        elif not isinstance(lines, list):
            normalized["lines"] = []
    return normalized


def execute_agent_tool(name, arguments, payload):
    arguments = normalize_agent_tool_arguments(name, arguments, payload)
    if name == "web_search":
        return mcp_tool_web_search(arguments)
    if name == "navigate":
        return mcp_tool_navigate(arguments)
    if name == "render_route_map":
        return mcp_tool_render_route_map(arguments)
    if name == "route_matrix":
        return mcp_tool_route_matrix(arguments)
    if name == "fare_quote":
        return mcp_tool_fare_quote(arguments)
    if name == "weather_current":
        return mcp_tool_weather_current(arguments)
    if name == "tfl_status":
        return mcp_tool_tfl_status(arguments)
    raise MCPToolError(f"Unknown agent tool: {name}", status=404, payload={"error": f"Unknown agent tool: {name}"})


def status_queries_from_navigation(result):
    if not isinstance(result, dict):
        return []
    recommended = result.get("recommended") or {}
    queries = []
    for line in recommended.get("transitLines") or []:
        if not isinstance(line, dict):
            continue
        query = line.get("statusQuery") or line.get("shortName") or line.get("name")
        if query and query not in queries:
            queries.append(query)
    return queries


def maybe_attach_tfl_status(tool_result):
    queries = status_queries_from_navigation(tool_result)
    if not queries:
        return None
    emit_mcp_progress({"type": "tool", "name": "tfl_status", "status": "started"})
    try:
        tfl_result = mcp_tool_tfl_status({"lines": queries})
        tool_result["lineStatuses"] = tfl_result
        return {
            "name": "tfl_status",
            "arguments": {"lines": queries},
            "status": "ok",
            "_fullResult": tfl_result,
            "result": agent_observation_payload("tfl_status", tfl_result),
        }
    except Exception as error:
        tool_result["lineStatusError"] = str(error)
        return {
            "name": "tfl_status",
            "arguments": {"lines": queries},
            "status": "error",
            "error": str(error),
        }


def extract_agent_result_fields(tool_calls):
    result = {}
    for item in tool_calls:
        if item.get("status") != "ok":
            continue
        payload = item.get("_fullResult") or item.get("result")
        if not isinstance(payload, dict):
            continue
        if item.get("name") in {"navigate", "render_route_map"}:
            public_payload = {key: value for key, value in payload.items() if key not in {"answer", "provider"}}
            result.update(public_payload)
            result["navigation"] = payload
        elif item.get("name") == "weather_current":
            result["weather"] = payload
        elif item.get("name") == "fare_quote":
            result["fareQuote"] = payload
        elif item.get("name") == "tfl_status":
            result["tflStatus"] = payload
    return result


def clean_search_text(value, limit=700):
    text = html.unescape(str(value or ""))
    text = " ".join(text.replace("\n", " ").split())
    return text[:limit].rstrip()


def infer_search_language(query, language=None):
    code = str(language or "").strip().lower()
    if code.startswith("zh"):
        return "zh"
    if code.startswith("en"):
        return "en"
    text = str(query or "")
    return "zh" if any("\u4e00" <= char <= "\u9fff" for char in text) else "en"


def wikipedia_search_url(query, language, limit):
    params = urllib.parse.urlencode(
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": query,
            "gsrlimit": str(limit),
            "prop": "extracts|info",
            "exintro": "1",
            "explaintext": "1",
            "inprop": "url",
            "format": "json",
            "origin": "*",
        }
    )
    return f"https://{language}.wikipedia.org/w/api.php?{params}"


def duckduckgo_instant_url(query):
    params = urllib.parse.urlencode(
        {
            "q": query,
            "format": "json",
            "no_redirect": "1",
            "no_html": "1",
            "skip_disambig": "1",
        }
    )
    return f"https://api.duckduckgo.com/?{params}"


def fetch_json_url(url, timeout=15):
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": f"{APP_NAME}/1.0",
        },
        method="GET",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8", errors="replace"))


def clean_tfl_text(value, limit=260):
    text = " ".join(str(value or "").replace("\n", " ").split())
    return text[:limit].rstrip()


def tfl_status_url():
    api_key = get_env_value("TFL_API_KEY") or get_env_value("TFL_APP_KEY")
    if not api_key:
        return TFL_LINE_STATUS_URL
    separator = "&" if "?" in TFL_LINE_STATUS_URL else "?"
    return f"{TFL_LINE_STATUS_URL}{separator}{urllib.parse.urlencode({'app_key': api_key})}"


def with_tfl_api_key(url):
    api_key = get_env_value("TFL_API_KEY") or get_env_value("TFL_APP_KEY")
    if not api_key:
        return url
    separator = "&" if "?" in url else "?"
    return f"{url}{separator}{urllib.parse.urlencode({'app_key': api_key})}"


def tfl_line_status_by_ids_url(line_ids):
    joined_ids = ",".join(urllib.parse.quote(str(line_id), safe="") for line_id in line_ids if str(line_id or "").strip())
    url = f"https://api.tfl.gov.uk/Line/{joined_ids}/Status"
    return with_tfl_api_key(url)


def tfl_stop_point_nearby_url(lat, lng):
    params = urllib.parse.urlencode(
        {
            "lat": f"{lat:.6f}",
            "lon": f"{lng:.6f}",
            "stopTypes": TFL_STOP_POINT_TYPES,
            "radius": "160",
        }
    )
    return with_tfl_api_key(f"https://api.tfl.gov.uk/StopPoint?{params}")


def tfl_stop_point_search_url(query, modes=None):
    params = urllib.parse.urlencode(
        {
            "modes": modes or TFL_STOP_POINT_MODES,
            "includeHubs": "true",
            "maxResults": "8",
        }
    )
    return with_tfl_api_key(f"https://api.tfl.gov.uk/StopPoint/Search/{urllib.parse.quote(str(query or ''), safe='')}?{params}")


def tfl_stop_point_by_id_url(stop_id):
    return with_tfl_api_key(f"https://api.tfl.gov.uk/StopPoint/{urllib.parse.quote(str(stop_id), safe='')}")


def normalize_tfl_line(line):
    statuses = line.get("lineStatuses") if isinstance(line, dict) else []
    statuses = statuses if isinstance(statuses, list) else []
    status = min(statuses, key=lambda item: item.get("statusSeverity", 10)) if statuses else {}
    severity = status.get("statusSeverity", 10)
    reason = clean_tfl_text(status.get("reason") or status.get("disruption", {}).get("description"))
    return {
        "id": line.get("id"),
        "name": line.get("name"),
        "mode": line.get("modeName"),
        "status": status.get("statusSeverityDescription") or "Status unknown",
        "severity": severity,
        "reason": reason,
    }


def fetch_tfl_line_status():
    data = fetch_json_url(tfl_status_url(), timeout=20)
    lines = [normalize_tfl_line(line) for line in data if isinstance(line, dict)]
    lines.sort(key=lambda item: (item.get("mode") or "", item.get("name") or ""))
    disrupted = [line for line in lines if line.get("severity", 10) < 10]
    return {
        "provider": "tfl_unified_api",
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "summary": {
            "total": len(lines),
            "disrupted": len(disrupted),
            "good": len(lines) - len(disrupted),
        },
        "lines": lines,
    }


def fetch_tfl_line_status_by_ids(line_ids):
    if not line_ids:
        return []
    data = fetch_json_url(tfl_line_status_by_ids_url(line_ids), timeout=20)
    return [normalize_tfl_line(line) for line in data if isinstance(line, dict)]


def tfl_stop_candidates(data):
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]
    if not isinstance(data, dict):
        return []
    for key in ("stopPoints", "matches", "children"):
        value = data.get(key)
        if isinstance(value, list):
            return [item for item in value if isinstance(item, dict)]
    return [data] if data.get("id") or data.get("naptanId") else []


def tfl_stop_lat_lng(stop):
    lat = stop.get("lat") or stop.get("latitude")
    lng = stop.get("lon") or stop.get("lng") or stop.get("longitude")
    if isinstance(lat, (int, float)) and isinstance(lng, (int, float)):
        return {"lat": lat, "lng": lng}
    return None


def distance_meters(first, second):
    if not first or not second:
        return 999999
    lat1 = math.radians(first["lat"])
    lat2 = math.radians(second["lat"])
    delta_lat = math.radians(second["lat"] - first["lat"])
    delta_lng = math.radians(second["lng"] - first["lng"])
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lng / 2) ** 2
    return 6371000 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def normalize_stop_line(line, fallback_mode=""):
    if isinstance(line, str):
        return {"id": line, "name": line, "mode": fallback_mode}
    if not isinstance(line, dict):
        return None
    name = line.get("name") or line.get("lineName") or line.get("id")
    if not name:
        return None
    return {
        "id": line.get("id") or line.get("lineId") or name,
        "name": name,
        "mode": line.get("modeName") or line.get("mode") or fallback_mode,
    }


def normalize_stop_modes(stop):
    modes = []
    for mode in stop.get("modes") or []:
        if mode and mode not in modes:
            modes.append(mode)
    for group in stop.get("lineModeGroups") or []:
        mode = group.get("modeName") if isinstance(group, dict) else None
        if mode and mode not in modes:
            modes.append(mode)
    return modes


def normalize_stop_lines(stop):
    lines = []
    seen = set()
    for line in stop.get("lines") or []:
        normalized = normalize_stop_line(line)
        if not normalized:
            continue
        key = normalized.get("id") or normalized.get("name")
        if key in seen:
            continue
        seen.add(key)
        lines.append(normalized)
    for group in stop.get("lineModeGroups") or []:
        if not isinstance(group, dict):
            continue
        mode = group.get("modeName") or ""
        for line_id in group.get("lineIdentifier") or []:
            normalized = normalize_stop_line(str(line_id), fallback_mode=mode)
            key = normalized.get("id")
            if key in seen:
                continue
            seen.add(key)
            lines.append(normalized)
    return lines


def normalize_tfl_stop_point(stop, source):
    return {
        "id": stop.get("id") or stop.get("naptanId") or stop.get("icsId"),
        "name": clean_tfl_text(stop.get("commonName") or stop.get("name"), limit=140),
        "modes": normalize_stop_modes(stop),
        "lines": normalize_stop_lines(stop),
        "metadataSource": source,
    }


def best_tfl_stop_candidate(candidates, location):
    if not candidates:
        return None
    if not location:
        return candidates[0]
    return min(candidates, key=lambda item: distance_meters(location, tfl_stop_lat_lng(item)))


def preferred_tfl_modes_for_stop(stop):
    vehicle = str(stop.get("vehicleType") or "").upper()
    route_lines = stop.get("routeLines") if isinstance(stop.get("routeLines"), list) else []
    route_text = " ".join(
        str(line.get("name") or line.get("shortName") or line.get("statusQuery") or "")
        for line in route_lines
        if isinstance(line, dict)
    ).lower()
    if vehicle == "BUS" or re.search(r"\b\d+[a-z]?\b", route_text):
        return {"bus"}
    if vehicle in {"SUBWAY", "METRO_RAIL", "RAIL", "HEAVY_RAIL", "COMMUTER_TRAIN", "TRAIN"}:
        return {"tube", "elizabeth-line", "overground", "dlr", "tram", "national-rail"}
    if "elizabeth" in route_text:
        return {"elizabeth-line", "tube", "overground", "national-rail"}
    if any(name in route_text for name in ("district", "circle", "jubilee", "central", "victoria", "piccadilly", "northern", "bakerloo", "metropolitan")):
        return {"tube", "elizabeth-line", "overground", "dlr", "national-rail"}
    return set()


def stop_matches_preferred_modes(stop, preferred_modes):
    if not preferred_modes:
        return True
    modes = set(normalize_stop_modes(stop))
    if modes & preferred_modes:
        return True
    for line in normalize_stop_lines(stop):
        if line.get("mode") in preferred_modes:
            return True
    return False


def filter_stop_candidates_for_route(candidates, preferred_modes):
    if not preferred_modes:
        return candidates
    filtered = [candidate for candidate in candidates if stop_matches_preferred_modes(candidate, preferred_modes)]
    return filtered or candidates


def fetch_tfl_stop_by_id(stop_id):
    if not stop_id:
        return None
    try:
        data = fetch_json_url(tfl_stop_point_by_id_url(stop_id), timeout=12)
    except Exception:
        return None
    return data if isinstance(data, dict) else None


def fetch_tfl_stop_metadata(stop, cache):
    name = stop.get("name")
    location = stop.get("location") or {}
    preferred_modes = preferred_tfl_modes_for_stop(stop)
    cache_key = f"{name}:{round(location.get('lat', 0), 5)}:{round(location.get('lng', 0), 5)}:{','.join(sorted(preferred_modes))}"
    if cache_key in cache:
        return cache[cache_key]

    candidates = []
    source = ""
    try:
        if isinstance(location.get("lat"), (int, float)) and isinstance(location.get("lng"), (int, float)):
            candidates = tfl_stop_candidates(fetch_json_url(tfl_stop_point_nearby_url(location["lat"], location["lng"]), timeout=12))
            source = "tfl_stoppoint_nearby"
            candidates = filter_stop_candidates_for_route(candidates, preferred_modes)
        if not candidates and name:
            search_modes = ",".join(sorted(preferred_modes)) if preferred_modes else None
            candidates = tfl_stop_candidates(fetch_json_url(tfl_stop_point_search_url(name, modes=search_modes), timeout=12))
            source = "tfl_stoppoint_search"
            candidates = filter_stop_candidates_for_route(candidates, preferred_modes)
    except Exception:
        cache[cache_key] = None
        return None

    candidate = best_tfl_stop_candidate(candidates, location)
    if not candidate:
        cache[cache_key] = None
        return None
    if not candidate.get("lines") and (candidate.get("id") or candidate.get("naptanId")):
        detailed = fetch_tfl_stop_by_id(candidate.get("id") or candidate.get("naptanId"))
        if detailed:
            candidate = detailed
            source = "tfl_stoppoint_detail"
    metadata = normalize_tfl_stop_point(candidate, source)
    cache[cache_key] = metadata
    return metadata


def enrich_route_stop_metadata(route, cache=None):
    stops = route.get("routeStops") if isinstance(route, dict) else None
    if not isinstance(stops, list) or not stops:
        return
    cache = cache if isinstance(cache, dict) else {}
    for stop in stops[:10]:
        metadata = fetch_tfl_stop_metadata(stop, cache)
        if not metadata:
            continue
        stop["servedModes"] = metadata.get("modes", [])
        stop["servedLines"] = metadata.get("lines", [])
        stop["metadataSource"] = metadata.get("metadataSource")
        stop["tflStopId"] = metadata.get("id")
        if metadata.get("name"):
            stop["tflName"] = metadata.get("name")


def canonical_tfl_name(value):
    text = html.unescape(str(value or "")).lower()
    text = text.replace("&", " and ")
    text = re.sub(r"\b(line|london|underground|tube|rail|service)\b", " ", text)
    return re.sub(r"[^a-z0-9]+", "", text)


def tfl_line_aliases(line):
    aliases = {canonical_tfl_name(line.get("id")), canonical_tfl_name(line.get("name"))}
    name = str(line.get("name") or "")
    aliases.add(canonical_tfl_name(name.replace("Line", "")))
    aliases.add(canonical_tfl_name(f"{name} line"))
    return {alias for alias in aliases if alias}


def filter_tfl_lines(lines, requested_lines):
    requested = [canonical_tfl_name(item) for item in requested_lines or [] if str(item or "").strip()]
    requested = [item for item in requested if item]
    if not requested:
        return lines
    matched = []
    for line in lines:
        aliases = tfl_line_aliases(line)
        if any(query in aliases or query == canonical_tfl_name(line.get("name")) for query in requested):
            matched.append(line)
    return matched


def tfl_id_candidates(value):
    text = html.unescape(str(value or "")).strip().lower()
    text = re.sub(r"\b(line|london|underground|tube|rail|service)\b", " ", text)
    text = " ".join(text.replace("&", " and ").split())
    candidates = {text}
    candidates.add(text.replace(" and ", "-"))
    candidates.add(text.replace(" ", "-"))
    candidates.add(re.sub(r"[^a-z0-9-]+", "", text))
    candidates.add(canonical_tfl_name(value))
    return [candidate for candidate in candidates if candidate]


def merge_tfl_lines(primary, extra):
    merged = []
    seen = set()
    for line in list(primary or []) + list(extra or []):
        key = line.get("id") or canonical_tfl_name(line.get("name"))
        if not key or key in seen:
            continue
        seen.add(key)
        merged.append(line)
    return merged


def mcp_tool_tfl_status(arguments):
    requested_lines = (arguments or {}).get("lines") or []
    if isinstance(requested_lines, str):
        requested_lines = [requested_lines]
    try:
        payload = fetch_tfl_line_status()
    except urllib.error.HTTPError as error:
        detail = read_http_error(error)
        raise MCPToolError(f"TfL status request failed: {detail}", status=error.code, payload={"error": f"TfL status request failed: {detail}"})
    except Exception as error:
        raise MCPToolError(f"TfL status unavailable: {error}", status=503, payload={"error": f"TfL status unavailable: {error}"})

    lines = filter_tfl_lines(payload.get("lines", []), requested_lines)
    if requested_lines:
        missing = []
        matched_aliases = set()
        for line in lines:
            matched_aliases.update(tfl_line_aliases(line))
        for requested in requested_lines:
            if canonical_tfl_name(requested) not in matched_aliases:
                missing.extend(tfl_id_candidates(requested))
        if missing:
            try:
                lines = merge_tfl_lines(lines, fetch_tfl_line_status_by_ids(missing))
            except Exception:
                pass
    disrupted = [line for line in lines if line.get("severity", 10) < 10]
    return {
        "provider": payload.get("provider"),
        "updatedAt": payload.get("updatedAt"),
        "requestedLines": requested_lines,
        "summary": {
            "total": len(lines),
            "disrupted": len(disrupted),
            "good": len(lines) - len(disrupted),
        },
        "lines": lines,
        "note": "" if lines else "No matching TfL lines were found for the requested names.",
    }


def mcp_tool_web_search(arguments):
    query = str((arguments or {}).get("query") or "").strip()
    if not query:
        raise MCPToolError("web_search requires a query.", status=400, payload={"error": "web_search requires a query."})

    limit = max(1, min(5, int((arguments or {}).get("limit") or 3)))
    language = infer_search_language(query, (arguments or {}).get("language"))
    results = []

    try:
        data = fetch_json_url(wikipedia_search_url(query, language, limit), timeout=15)
        pages = (data.get("query") or {}).get("pages") or {}
        ordered_pages = sorted(pages.values(), key=lambda item: item.get("index", 9999))
        for page in ordered_pages:
            title = clean_search_text(page.get("title"), limit=160)
            extract = clean_search_text(page.get("extract"), limit=650)
            url = page.get("fullurl") or f"https://{language}.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"
            if title and (extract or url):
                results.append({"title": title, "url": url, "snippet": extract, "source": "Wikipedia"})
    except Exception:
        results = []

    if not results:
        try:
            data = fetch_json_url(duckduckgo_instant_url(query), timeout=15)
            title = clean_search_text(data.get("Heading") or query, limit=160)
            snippet = clean_search_text(data.get("AbstractText") or data.get("Definition"), limit=650)
            url = data.get("AbstractURL") or data.get("DefinitionURL")
            if title and (snippet or url):
                results.append({"title": title, "url": url, "snippet": snippet, "source": "DuckDuckGo"})
        except Exception:
            results = []

    return {
        "query": query,
        "language": language,
        "provider": "wikipedia_duckduckgo",
        "results": results,
        "note": "" if results else "No web search results were found for this query.",
    }


def public_tool_trace(tool_trace):
    public_items = []
    for item in tool_trace:
        public_item = {
            "name": item.get("name"),
            "arguments": item.get("arguments"),
            "status": item.get("status"),
        }
        if item.get("error"):
            public_item["error"] = item.get("error")
        if item.get("result") is not None:
            public_item["result"] = item.get("result")
        public_items.append(public_item)
    return public_items


def has_successful_route_map_trace(tool_trace):
    return any(
        item.get("status") == "ok" and item.get("name") == "render_route_map"
        for item in tool_trace
    )


def ensure_route_map_tool_trace(tool_trace, latest_navigation_tool_result):
    items = list(tool_trace or [])
    if not isinstance(latest_navigation_tool_result, dict):
        return items
    if not latest_navigation_tool_result.get("recommended"):
        return items
    if has_successful_route_map_trace(items):
        return items

    synthetic_result = dict(latest_navigation_tool_result)
    synthetic_result["inlineMapRequested"] = True
    items.append(
        {
            "name": "render_route_map",
            "arguments": {
                "_auto": True,
                "reason": "auto-attached after successful navigate result",
            },
            "status": "ok",
            "_fullResult": synthetic_result,
            "result": agent_observation_payload("render_route_map", synthetic_result),
        }
    )
    return items


def build_agent_content_blocks(answer, tool_trace):
    blocks = [{"type": "markdown", "text": str(answer or "")}]
    for item in tool_trace:
        if item.get("status") != "ok" or item.get("name") != "render_route_map":
            continue
        payload = item.get("_fullResult") or item.get("result")
        if isinstance(payload, dict):
            public_payload = {key: value for key, value in payload.items() if key not in {"answer", "provider"}}
            blocks.append({"type": "route_map", "data": public_payload})
            break
    return blocks


def resolve_chat_target(payload):
    provider = get_llm_provider()
    if provider != "together":
        return {
            "provider": provider,
            "model": current_llm_model(),
            "chatModelId": "",
        }

    context = payload.get("context") or {}
    if isinstance(context, dict) and context.get("task") == "weather_summary":
        return {
            "provider": "together",
            "model": get_weather_summary_together_model(),
            "chatModelId": "",
        }

    requested_id = str(payload.get("chatModelId") or "").strip() or get_default_chat_model_id()
    selected = resolve_together_chat_model(requested_id)
    if not selected:
        raise MCPToolError(
            "The selected chat model is unavailable. Please switch models and try again.",
            status=400,
            payload={"error": "The selected chat model is unavailable. Please switch models and try again."},
        )
    return {
        "provider": "together",
        "model": str(selected.get("model") or get_together_model()),
        "chatModelId": str(selected.get("id") or requested_id),
    }


def mcp_tool_agent_answer(arguments):
    payload = (arguments or {}).get("payload") or {}
    context = payload.get("context") or {}
    if isinstance(context, dict) and context.get("task") == "weather_summary":
        result = mcp_tool_chat_complete({"payload": payload})
        result.setdefault("toolsUsed", [])
        result.setdefault("toolCalls", [])
        return result

    chat_target = resolve_chat_target(payload)
    provider = chat_target["provider"]
    if provider not in {"groq", "openai", "together"}:
        result = mcp_tool_chat_complete({"payload": payload})
        result.setdefault("toolsUsed", [])
        result.setdefault("toolCalls", [])
        return result

    messages = [
        {"role": "system", "content": agent_system_prompt()},
        {"role": "user", "content": agent_user_prompt(payload)},
    ]
    tools = agent_tool_schema_definitions()
    tool_trace = []
    latest_navigation_tool_result = None

    try:
        for _ in range(AGENT_TOOL_CALL_LIMIT):
            message = call_tool_choice_model(messages, tools, provider_override=provider, model_override=chat_target["model"])
            tool_calls = message.get("tool_calls") or []
            if not tool_calls:
                answer = strip_reasoning_text(message.get("content") or "").strip()
                if not answer:
                    fallback = mcp_tool_chat_complete({"payload": payload})
                    answer = fallback.get("answer", "") if isinstance(fallback, dict) else str(fallback or "")
                elif str(message.get("_finishReason") or "").lower() in {"length", "max_tokens", "max_completion_tokens"}:
                    answer = continue_truncated_agent_answer(messages, answer, provider, chat_target["model"])
                finalized_tool_trace = ensure_route_map_tool_trace(tool_trace, latest_navigation_tool_result)
                result = {
                    "answer": answer,
                    "contentBlocks": build_agent_content_blocks(answer, finalized_tool_trace),
                    "model": chat_target["model"],
                    "provider": provider,
                    "chatModelId": chat_target["chatModelId"],
                    "toolsUsed": [item["name"] for item in finalized_tool_trace if item.get("status") == "ok"],
                    "toolCalls": public_tool_trace(finalized_tool_trace),
                }
                result.update(extract_agent_result_fields(finalized_tool_trace))
                return result

            assistant_message = {
                "role": "assistant",
                "content": message.get("content") or "",
                "tool_calls": tool_calls,
            }
            messages.append(assistant_message)

            for call in tool_calls:
                function = call.get("function") or {}
                name = function.get("name")
                raw_arguments = function.get("arguments")
                parsed_arguments = parse_tool_arguments(raw_arguments)
                trace_item = {"name": name, "arguments": parsed_arguments, "status": "ok"}
                try:
                    if name not in agent_tool_names():
                        raise MCPToolError(f"Tool is not available to the agent: {name}", status=404)
                    emit_mcp_progress({"type": "tool", "name": name, "status": "started"})
                    if name == "render_route_map" and isinstance(latest_navigation_tool_result, dict):
                        tool_result = dict(latest_navigation_tool_result)
                        tool_result["inlineMapRequested"] = True
                    else:
                        tool_result = execute_agent_tool(name, parsed_arguments, payload)
                    extra_trace_item = maybe_attach_tfl_status(tool_result) if name == "navigate" else None
                    if name == "navigate" and isinstance(tool_result, dict) and tool_result.get("recommended"):
                        latest_navigation_tool_result = dict(tool_result)
                    trace_item["_fullResult"] = tool_result
                    trace_item["result"] = agent_observation_payload(name, tool_result)
                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": call.get("id"),
                            "name": name,
                            "content": compact_json(trace_item["result"], limit=5200 if name in {"navigate", "render_route_map"} else 2800),
                        }
                    )
                except Exception as error:
                    extra_trace_item = None
                    trace_item["status"] = "error"
                    trace_item["error"] = str(error)
                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": call.get("id"),
                            "name": name or "unknown",
                            "content": compact_json({"error": str(error)}, limit=2000),
                        }
                    )
                tool_trace.append(trace_item)
                if extra_trace_item:
                    tool_trace.append(extra_trace_item)

        final = mcp_tool_chat_complete({"payload": payload})
        answer = final.get("answer", "") if isinstance(final, dict) else str(final or "")
        finalized_tool_trace = ensure_route_map_tool_trace(tool_trace, latest_navigation_tool_result)
        result = {
            "answer": answer,
            "contentBlocks": build_agent_content_blocks(answer, finalized_tool_trace),
            "model": chat_target["model"],
            "provider": provider,
            "chatModelId": chat_target["chatModelId"],
            "toolsUsed": [item["name"] for item in finalized_tool_trace if item.get("status") == "ok"],
            "toolCalls": public_tool_trace(finalized_tool_trace),
        }
        result.update(extract_agent_result_fields(finalized_tool_trace))
        return result
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="replace")
        formatted = format_model_http_error(message)
        raise MCPToolError(
            f"{formatted} You can try switching to the other model and retrying.",
            status=error.code,
            payload={"error": f"{formatted} You can try switching to the other model and retrying."},
        )
    except urllib.error.URLError:
        raise MCPToolError(
            "The model service could not be reached. You can try switching to the other model and retrying.",
            status=503,
            payload={"error": "The model service could not be reached. You can try switching to the other model and retrying."},
        )


def mcp_tool_health(arguments):
    llm_status = check_llm_health()
    together_ready = bool(get_together_api_key())
    chat_models = [
        {
            "id": item.get("id"),
            "label": item.get("label"),
            "description": item.get("description", ""),
            "available": together_ready,
            "model": item.get("model"),
        }
        for item in get_together_chat_models()
    ]
    return {
        "ok": True,
        "app": APP_NAME,
        "provider": get_llm_provider(),
        "model": current_llm_model(),
        "defaultChatModelId": get_default_chat_model_id(),
        "chatModels": chat_models,
        "streaming": True,
        "llmConnected": llm_status["connected"],
        "llmStatus": llm_status["label"],
        "googleMapsConfigured": bool(get_google_maps_api_key()),
        "googleMapsBrowserConfigured": bool(get_google_maps_browser_key()),
        "googleMapsBrowserKey": get_google_maps_browser_key(),
        "mcpConnected": True,
        "mcpTools": ["agent_answer", "chat_complete", "classify_intent", "web_search", "route_matrix", "fare_quote", "navigate", "render_route_map", "weather_current", "tfl_status"],
    }


def mcp_tool_chat_complete(arguments):
    payload = (arguments or {}).get("payload") or {}
    chat_target = resolve_chat_target(payload)
    provider = chat_target["provider"]
    try:
        if provider == "openai":
            api_key = get_openai_api_key()
            if not api_key:
                raise MCPToolError(
                    "未配置 OPENAI_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                    status=500,
                    payload={
                        "error": "未配置 OPENAI_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                        "setup": "LLM_PROVIDER=openai OPENAI_API_KEY=你的密钥 python3 server.py",
                    },
                )
            return {"answer": call_openai(api_key, payload), "model": get_openai_model(), "provider": "openai"}

        if provider == "groq":
            api_key = get_groq_api_key()
            if not api_key:
                raise MCPToolError(
                    "未配置 GROQ_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                    status=500,
                    payload={
                        "error": "未配置 GROQ_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                        "setup": "LLM_PROVIDER=groq GROQ_API_KEY=你的密钥 python3 server.py",
                    },
                )
            return {"answer": call_groq(api_key, payload), "model": get_groq_model(), "provider": "groq"}

        if provider == "together":
            api_key = get_together_api_key()
            if not api_key:
                raise MCPToolError(
                    "未配置 TOGETHER_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                    status=500,
                    payload={
                        "error": "未配置 TOGETHER_API_KEY。请在启动服务前设置环境变量，然后重新提问。",
                        "setup": "LLM_PROVIDER=together TOGETHER_API_KEY=你的密钥 python3 server.py",
                    },
                )
            return {
                "answer": call_together(api_key, payload, model_override=chat_target["model"]),
                "model": chat_target["model"],
                "provider": "together",
                "chatModelId": chat_target["chatModelId"],
            }

        answer = "".join(call_ollama_stream(payload)).strip()
        if not answer:
            answer = "本地模型返回为空。可以尝试换用 qwen2.5:3b 或进一步降低 OLLAMA_NUM_PREDICT。"
        return {"answer": answer, "model": get_ollama_model(), "provider": "ollama"}
    except MCPToolError:
        raise
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="replace")
        formatted = format_model_http_error(message)
        hint = " You can try switching to the other model and retrying." if provider == "together" else ""
        raise MCPToolError(f"{formatted}{hint}", status=error.code, payload={"error": f"{formatted}{hint}"})
    except urllib.error.URLError:
        if provider == "ollama":
            raise MCPToolError(
                "无法连接本地 Ollama 服务。请确认 Ollama 已安装并正在运行。",
                status=503,
                payload={
                    "error": "无法连接本地 Ollama 服务。请确认 Ollama 已安装并正在运行。",
                    "setup": f"ollama run {get_ollama_model()}",
                },
            )
        if provider == "together":
            message = "The model service could not be reached. You can try switching to the other model and retrying."
            raise MCPToolError(message, status=503, payload={"error": message})
        raise MCPToolError("模型服务连接失败，请稍后重试。", status=503, payload={"error": "模型服务连接失败，请稍后重试。"})


def mcp_tool_classify_intent(arguments):
    try:
        question = str((arguments or {}).get("question", "")).strip()
        if not question:
            return {"mode": "study", "confidence": 0, "reason": "empty question"}
        return classify_agent_intent(question, (arguments or {}).get("contextStart"), (arguments or {}).get("history", []))
    except Exception as error:
        return {"mode": "study", "confidence": 0, "reason": f"Intent check failed: {error}"}


def mcp_tool_route_matrix(arguments):
    api_key = get_google_maps_api_key()
    if not api_key:
        raise MCPToolError(
            "GOOGLE_MAPS_API_KEY is not configured.",
            status=500,
            payload={"error": "GOOGLE_MAPS_API_KEY is not configured."},
        )

    start = (arguments or {}).get("start", {})
    destinations = (arguments or {}).get("destinations", [])
    if not valid_lat_lng(start) or not destinations:
        raise MCPToolError(
            "Route request requires a start point and destinations.",
            status=400,
            payload={"error": "Route request requires a start point and destinations."},
        )

    try:
        routes = call_google_route_matrix(api_key, start, destinations)
        return {"routes": routes, "provider": "google_routes", "travelMode": GOOGLE_TRAVEL_MODE}
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="replace")
        raise MCPToolError(f"Google Routes API failed: {message}", status=error.code, payload={"error": f"Google Routes API failed: {message}"})


def weather_location_from_arguments(arguments):
    location = (arguments or {}).get("location") or {}
    if not isinstance(location, dict):
        location = {"query": str(location)}
    if valid_lat_lng(location):
        return {
            "name": location.get("name") or location.get("label") or "Selected location",
            "lat": location["lat"],
            "lng": location["lng"],
        }

    place_text = (
        location.get("query")
        or location.get("place")
        or location.get("name")
        or location.get("label")
        or (arguments or {}).get("query")
        or (arguments or {}).get("place")
    )
    resolved = resolve_location(place_text)
    if valid_lat_lng(resolved):
        return {
            "name": resolved.get("name") or str(place_text or "Selected location"),
            "lat": resolved["lat"],
            "lng": resolved["lng"],
        }
    return None


def weather_api_url(location, api_key):
    params = urllib.parse.urlencode(
        {
            "key": api_key,
            "location.latitude": str(location["lat"]),
            "location.longitude": str(location["lng"]),
            "unitsSystem": "METRIC",
            "languageCode": "en",
        }
    )
    return f"https://weather.googleapis.com/v1/currentConditions:lookup?{params}"


def google_weather_search_link(location):
    if not valid_lat_lng(location):
        return ""
    lat = float(location["lat"])
    lng = float(location["lng"])
    is_london_coordinate = 51.28 <= lat <= 51.70 and -0.55 <= lng <= 0.35
    label = str(location.get("name") or location.get("label") or "").strip()
    placeholder_labels = {
        "current location",
        "map selection",
        "selected start point",
        "selected location",
        "navigation destination",
        "当前位置",
        "地图选点",
        "已选出发点",
        "当前选择的位置",
        "导航目的地",
    }
    query_place = "London" if is_london_coordinate or not label or label.lower() in placeholder_labels else re.sub(r"\s+nearby$", "", label, flags=re.IGNORECASE)
    query = f"weather {query_place}"
    return f"https://www.google.com/search?{urllib.parse.urlencode({'q': query})}"


def is_uk_coordinate(place):
    if not valid_lat_lng(place):
        return False
    lat = float(place["lat"])
    lng = float(place["lng"])
    return 49.75 <= lat <= 61.2 and -8.8 <= lng <= 2.2


def route_is_uk(route_context):
    if not isinstance(route_context, dict):
        return False
    points = [
        route_context.get("originPlace") or route_context.get("origin"),
        route_context.get("destinationPlace") or route_context.get("destination"),
        *route_context.get("waypointPlaces", []),
    ]
    valid_points = [point for point in points if valid_lat_lng(point)]
    return bool(valid_points) and all(is_uk_coordinate(point) for point in valid_points)


def normalize_route_fare(fare):
    if not isinstance(fare, dict):
        return None
    currency = str(fare.get("currency") or "").upper()
    amount_pence = fare.get("amountPence")
    display = str(fare.get("display") or "").strip()
    if currency != "GBP" or not isinstance(amount_pence, int) or amount_pence < 0:
        return None
    if not display.startswith("£"):
        display = f"£{amount_pence / 100:.2f}"
    normalized = {
        "amountPence": amount_pence,
        "currency": "GBP",
        "display": display,
        "source": fare.get("source") or "unknown",
        "confidence": fare.get("confidence") or "provider",
    }
    if fare.get("notes"):
        normalized["notes"] = fare.get("notes")
    return normalized


def tfl_fare_quote(arguments):
    return None


def national_rail_fare_quote(arguments):
    return None


def mcp_tool_fare_quote(arguments):
    route_summary = (arguments or {}).get("routeSummary") or (arguments or {}).get("route") or {}
    route_context = {
        "originPlace": (arguments or {}).get("originPlace"),
        "destinationPlace": (arguments or {}).get("destinationPlace"),
        "waypointPlaces": (arguments or {}).get("waypointPlaces") or [],
    }
    if not route_is_uk(route_context):
        return {
            "fare": None,
            "fareBreakdown": [],
            "bookableServices": [],
            "providerWarnings": [],
        }

    fare = normalize_route_fare(route_summary.get("fare"))
    fare_breakdown = route_summary.get("fareBreakdown") if isinstance(route_summary.get("fareBreakdown"), list) else []
    source = "google_routes_transit_fare" if fare else ""

    for provider in (tfl_fare_quote, national_rail_fare_quote):
        provider_result = provider(arguments)
        if not isinstance(provider_result, dict):
            continue
        provider_fare = normalize_route_fare(provider_result.get("fare"))
        if provider_fare:
            fare = provider_fare
            source = provider_fare.get("source") or source
        if isinstance(provider_result.get("fareBreakdown"), list):
            fare_breakdown = provider_result["fareBreakdown"]

    return {
        "fare": fare,
        "fareBreakdown": fare_breakdown if fare else [],
        "bookableServices": [],
        "providerWarnings": [],
        "source": source,
    }


def enrich_route_fares(route_request, routes):
    if not routes:
        return
    route_context = {
        "originPlace": public_place_payload(route_request.get("origin")),
        "destinationPlace": public_place_payload(route_request.get("destination")),
        "waypointPlaces": [public_place_payload(item) for item in route_request.get("waypoints", []) if public_place_payload(item)],
    }
    if not route_is_uk(route_context):
        for route in routes:
            route.pop("fare", None)
            route.pop("fareBreakdown", None)
        return
    for route in routes:
        if route.get("mode") != "TRANSIT":
            route.pop("fare", None)
            route.pop("fareBreakdown", None)
            continue
        quote = mcp_tool_fare_quote(
            {
                **route_context,
                "departureTime": route_request.get("departureTime"),
                "transitSteps": route.get("transitSteps") or [],
                "routeSummary": route,
            }
        )
        fare = quote.get("fare") if isinstance(quote, dict) else None
        if fare:
            route["fare"] = fare
            if quote.get("fareBreakdown"):
                route["fareBreakdown"] = quote["fareBreakdown"]
            else:
                route.setdefault("fareBreakdown", [])
        else:
            route.pop("fare", None)
            route.pop("fareBreakdown", None)


def mcp_tool_weather_current(arguments):
    api_key = get_google_maps_browser_key() or get_google_maps_api_key()
    if not api_key:
        raise MCPToolError(
            "Google Weather API key is not configured.",
            status=500,
            payload={"error": "Google Weather API key is not configured."},
        )
    location = weather_location_from_arguments(arguments)
    if not location:
        raise MCPToolError(
            "Weather request requires a location with coordinates or a resolvable place name.",
            status=400,
            payload={"error": "Weather request requires a location with coordinates or a resolvable place name."},
        )

    request = urllib.request.Request(
        weather_api_url(location, api_key),
        headers={
            "Accept": "application/json",
            "User-Agent": f"{APP_NAME}/1.0",
            "Referer": get_env_value("GOOGLE_WEATHER_REFERER") or "https://ada-yz1825.github.io/",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8", errors="replace"))
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="replace")
        raise MCPToolError(f"Google Weather API failed: {message}", status=error.code, payload={"error": f"Google Weather API failed: {message}"})
    except urllib.error.URLError as error:
        raise MCPToolError(f"Google Weather API connection failed: {error.reason}", status=503, payload={"error": f"Google Weather API connection failed: {error.reason}"})

    return {
        "location": location,
        "provider": "google_weather",
        "weatherLink": google_weather_search_link(location),
        "current": {
            "time": data.get("currentTime"),
            "condition": data.get("weatherCondition", {}).get("description", {}).get("text")
            or data.get("weatherCondition", {}).get("type"),
            "conditionType": data.get("weatherCondition", {}).get("type"),
            "isDaytime": data.get("isDaytime"),
            "temperatureC": data.get("temperature", {}).get("degrees"),
            "feelsLikeC": data.get("feelsLikeTemperature", {}).get("degrees"),
            "humidityPercent": data.get("relativeHumidity"),
            "wind": data.get("wind"),
            "uvIndex": data.get("uvIndex"),
            "precipitation": data.get("precipitation"),
        },
    }


def mcp_tool_navigate(arguments):
    api_key = get_google_maps_api_key()
    if not api_key:
        raise MCPToolError(
            "GOOGLE_MAPS_API_KEY is not configured.",
            status=500,
            payload={"error": "GOOGLE_MAPS_API_KEY is not configured."},
        )

    try:
        query = str((arguments or {}).get("query", "")).strip()
        agent_tool_mode = bool((arguments or {}).get("_agentTool"))
        route_request = parse_navigation_query(query, (arguments or {}).get("history", []))
        apply_context_start(route_request, (arguments or {}).get("contextStart"))
        resolve_route_request_contextual_places(route_request, query)
        if not route_request.get("origin") or not route_request.get("destination"):
            raise MCPToolError(
                "Please ask with an origin and destination, for example: from South Kensington to Hammersmith Campus.",
                status=400,
                payload={
                    "error": "Please ask with an origin and destination, for example: from South Kensington to Hammersmith Campus.",
                },
            )

        modes = navigation_mode_candidates(route_request.get("mode"))
        route_options = []
        map_routes = []
        route_errors = []
        has_waypoints = bool(route_request.get("waypoints"))
        for mode in modes:
            try:
                route = None
                route_variants = []
                if has_waypoints:
                    route_variants = call_google_compute_route_variants(
                        api_key,
                        route_request["origin"],
                        route_request["destination"],
                        mode,
                        route_request["departureTime"],
                        allow_alternatives=True,
                        intermediates=route_request.get("waypoints"),
                    )
                else:
                    route = call_google_matrix_route(
                        api_key,
                        route_request["origin"],
                        route_request["destination"],
                        mode,
                        route_request["departureTime"],
                    )
                    if route:
                        route_variants = call_google_compute_route_variants(
                            api_key,
                            route_request["origin"],
                            route_request["destination"],
                            mode,
                            route_request["departureTime"],
                            allow_alternatives=True,
                        )
                if route_variants:
                    route_variants.sort(key=lambda item: item.get("durationMinutes") or 10**9)
                    for index, item in enumerate(route_variants):
                        item["routeVariantIndex"] = index
                        item["routeVariantCount"] = len(route_variants)
                    route_options.append(route_variants[0])
                    map_routes.extend(route_variants)
                elif route:
                    route_options.append(route)
                    map_routes.append(route)
                else:
                    route_errors.append(f"{mode_label(mode)}: Google returned no route element.")
            except urllib.error.HTTPError as error:
                route_errors.append(f"{mode_label(mode)}: {read_http_error(error)}")
            except urllib.error.URLError as error:
                route_errors.append(f"{mode_label(mode)}: {error.reason}")

        if not route_options:
            answer = "" if agent_tool_mode else build_navigation_answer(query, route_request, [], route_errors)
            origin_place = public_place_payload(route_request["origin"])
            destination_place = public_place_payload(route_request["destination"])
            waypoint_places = [public_place_payload(item) for item in route_request.get("waypoints", []) if public_place_payload(item)]
            return {
                "answer": answer,
                "origin": route_request["origin"]["name"],
                "destination": route_request["destination"]["name"],
                "originPlace": origin_place,
                "destinationPlace": destination_place,
                "waypoints": [item.get("name") for item in route_request.get("waypoints", []) if isinstance(item, dict) and item.get("name")],
                "waypointPlaces": waypoint_places,
                "destinationResolution": route_request.get("destination_resolution"),
                "routeLink": "",
                "relatedLinks": route_related_links(origin_place, destination_place, None, waypoint_places),
                "recommended": None,
                "alternatives": [],
                "mapRoutes": [],
                "imperial_weekday_shuttle": imperial_shuttle_context(route_request),
                "provider": "google_routes",
                "details": route_errors[:4],
            }

        requested_mode = route_request.get("mode")
        if requested_mode:
            route_options.sort(key=lambda item: (0 if item["mode"] == requested_mode else 1, item["durationMinutes"]))
        else:
            route_options.sort(key=lambda item: item["durationMinutes"])
        if requested_mode:
            map_routes.sort(key=lambda item: (0 if item["mode"] == requested_mode else 1, item["durationMinutes"]))
        else:
            map_routes.sort(key=lambda item: item["durationMinutes"])
        stop_metadata_cache = {}
        for route in map_routes:
            attach_route_geometry(api_key, route_request, route)
            enrich_route_stop_metadata(route, stop_metadata_cache)
        enrich_route_fares(route_request, map_routes)
        route_options_by_key = {id(route): route for route in map_routes}
        for route in route_options:
            if id(route) not in route_options_by_key:
                enrich_route_fares(route_request, [route])
        map_routes = diverse_route_options(map_routes)
        route_options = diverse_route_options(route_options)
        answer = "" if agent_tool_mode else build_navigation_answer(query, route_request, route_options, route_errors)
        origin_place = public_place_payload(route_request["origin"])
        destination_place = public_place_payload(route_request["destination"])
        waypoint_places = [public_place_payload(item) for item in route_request.get("waypoints", []) if public_place_payload(item)]
        route_link = google_maps_route_link(origin_place, destination_place, route_options[0], waypoint_places)
        route_alternatives = [route for route in map_routes if route is not route_options[0]]
        related_links = route_related_links(origin_place, destination_place, route_options[0], waypoint_places)
        return {
            "answer": answer,
            "origin": route_request["origin"]["name"],
            "destination": route_request["destination"]["name"],
            "originPlace": origin_place,
            "destinationPlace": destination_place,
            "waypoints": [item.get("name") for item in route_request.get("waypoints", []) if isinstance(item, dict) and item.get("name")],
            "waypointPlaces": waypoint_places,
            "destinationResolution": route_request.get("destination_resolution"),
            "routeLink": route_link,
            "relatedLinks": related_links,
            "recommended": route_options[0],
            "mapRoute": route_options[0],
            "alternatives": route_alternatives,
            "mapRoutes": map_routes or [route_options[0], *route_options[1:]],
            "imperial_weekday_shuttle": imperial_shuttle_context(route_request),
            "provider": "google_routes",
        }
    except MCPToolError:
        raise
    except urllib.error.HTTPError as error:
        message = error.read().decode("utf-8", errors="replace")
        raise MCPToolError(f"Google Routes API failed: {message}", status=error.code, payload={"error": f"Google Routes API failed: {message}"})


def mcp_tool_render_route_map(arguments):
    result = mcp_tool_navigate(arguments)
    if isinstance(result, dict):
        result["inlineMapRequested"] = True
        if not result.get("answer"):
            result["answer"] = ""
    return result


def mcp_tool_registry():
    return {
        "agent_answer": mcp_tool_agent_answer,
        "health": mcp_tool_health,
        "chat_complete": mcp_tool_chat_complete,
        "classify_intent": mcp_tool_classify_intent,
        "web_search": mcp_tool_web_search,
        "route_matrix": mcp_tool_route_matrix,
        "fare_quote": mcp_tool_fare_quote,
        "navigate": mcp_tool_navigate,
        "render_route_map": mcp_tool_render_route_map,
        "weather_current": mcp_tool_weather_current,
        "tfl_status": mcp_tool_tfl_status,
    }


def mcp_tool_descriptions():
    return [
        {
            "name": "agent_answer",
            "description": "Let a tool-calling LLM choose and call MCP tools, then return the final browser answer.",
            "inputSchema": {"type": "object", "properties": {"payload": {"type": "object"}}},
        },
        {
            "name": "health",
            "description": "Return backend, LLM, Google key, and MCP tool status for the browser adapter.",
            "inputSchema": {"type": "object", "properties": {}},
        },
        {
            "name": "chat_complete",
            "description": "Call the configured LLM provider and return a cleaned assistant answer.",
            "inputSchema": {"type": "object", "properties": {"payload": {"type": "object"}}},
        },
        {
            "name": "classify_intent",
            "description": "Classify whether a browser question should use study planning, conversation, or navigation.",
            "inputSchema": {"type": "object", "properties": {"question": {"type": "string"}}},
        },
        {
            "name": "web_search",
            "description": "Search Wikipedia and web instant-answer sources for factual or encyclopedia-style questions.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "language": {"type": "string"},
                    "limit": {"type": "integer"},
                },
                "required": ["query"],
            },
        },
        {
            "name": "route_matrix",
            "description": "Call Google Routes matrix for travel estimates to destinations.",
            "inputSchema": {"type": "object", "properties": {"start": {"type": "object"}, "destinations": {"type": "array"}}},
        },
        {
            "name": "fare_quote",
            "description": "Return UK public-transport total fare and optional per-leg fare details for a route when available.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "originPlace": {"type": "object"},
                    "destinationPlace": {"type": "object"},
                    "waypointPlaces": {"type": "array"},
                    "departureTime": {"type": "string"},
                    "transitSteps": {"type": "array"},
                    "routeSummary": {"type": "object"},
                },
            },
        },
        {
            "name": "navigate",
            "description": "Parse a navigation request, call Google Routes tools, and return the browser navigation JSON.",
            "inputSchema": {"type": "object", "properties": {"query": {"type": "string"}, "contextStart": {"type": "object"}, "history": {"type": "array"}}},
        },
        {
            "name": "render_route_map",
            "description": "Prepare the browser inline route-map payload for a navigation request.",
            "inputSchema": {"type": "object", "properties": {"query": {"type": "string"}, "contextStart": {"type": "object"}, "history": {"type": "array"}}},
        },
        {
            "name": "weather_current",
            "description": "Call Google Weather API for current conditions at a coordinate or named place.",
            "inputSchema": {"type": "object", "properties": {"location": {"type": "object"}}},
        },
        {
            "name": "tfl_status",
            "description": "Call TfL Unified API for live line status. Optionally filter by line names.",
            "inputSchema": {
                "type": "object",
                "properties": {"lines": {"type": "array", "items": {"type": "string"}}},
            },
        },
    ]


def make_mcp_tool_result(payload):
    return {
        "content": [{"type": "text", "text": json.dumps(payload, ensure_ascii=False)}],
        "structuredContent": payload,
    }


def handle_mcp_request(message):
    method = message.get("method")
    params = message.get("params") or {}
    if method == "initialize":
        return {
            "protocolVersion": "2024-11-05",
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "imperial-travel-agent-mcp", "version": "1.0"},
        }
    if method == "tools/list":
        return {"tools": mcp_tool_descriptions()}
    if method == "tools/call":
        name = params.get("name")
        arguments = params.get("arguments") or {}
        registry = mcp_tool_registry()
        if name not in registry:
            raise MCPToolError(f"Unknown MCP tool: {name}", status=404, payload={"error": f"Unknown MCP tool: {name}"})
        return make_mcp_tool_result(registry[name](arguments))
    if method == "ping":
        return {}
    raise MCPToolError(f"Unsupported MCP method: {method}", status=400, payload={"error": f"Unsupported MCP method: {method}"})


def run_mcp_server():
    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue
        request_id = None
        try:
            message = json.loads(line)
            request_id = message.get("id")
            if request_id is None:
                continue
            result = handle_mcp_request(message)
            response = {"jsonrpc": "2.0", "id": request_id, "result": result}
        except MCPToolError as error:
            response = {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": -32000,
                    "message": str(error),
                    "data": {"status": error.status, "payload": error.payload},
                },
            }
        except Exception as error:
            response = {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {
                    "code": -32603,
                    "message": str(error),
                    "data": {"status": 500, "payload": {"error": str(error)}},
                },
            }
        sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
        sys.stdout.flush()


def main():
    try:
        run_mcp_server()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
