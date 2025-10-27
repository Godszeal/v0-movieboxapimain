"""
Wrapper script to interact with MovieBox API and return JSON responses
This script is called by Next.js API routes to fetch actual data
"""

import asyncio
import json
import sys
from pathlib import Path

# Add src to path to import moviebox_api
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.moviebox_api.core import (
    Homepage,
    Search,
    Trending,
    PopularSearch,
    SearchSuggestion,
    MovieDetails,
    TVSeriesDetails,
)
from src.moviebox_api.requests import Session
from src.moviebox_api.constants import SubjectType
from src.moviebox_api.download import DownloadableMovieFilesDetail, DownloadableTVSeriesFilesDetail
from src.moviebox_api.stream import StreamFilesDetail


async def fetch_search(query: str, subject_type: str = "ALL", page: int = 1, per_page: int = 24) -> dict:
    """Fetch search results from MovieBox API"""
    try:
        session = Session()
        
        # Map string to SubjectType enum
        subject_type_map = {
            "ALL": SubjectType.ALL,
            "MOVIES": SubjectType.MOVIES,
            "TV_SERIES": SubjectType.TV_SERIES,
            "MUSIC": SubjectType.MUSIC,
        }
        
        subject_enum = subject_type_map.get(subject_type, SubjectType.ALL)
        search = Search(session, query=query, subject_type=subject_enum, page=page, per_page=per_page)
        
        content = await search.get_content()
        
        # Add creator info
        content["creator"] = "God's Zeal"
        content["endpoint"] = "/api/search"
        
        return content
    except Exception as e:
        return {"error": str(e), "creator": "God's Zeal"}


async def fetch_trending(page: int = 0, per_page: int = 18) -> dict:
    """Fetch trending content from MovieBox API"""
    try:
        session = Session()
        trending = Trending(session, page=page, per_page=per_page)
        
        content = await trending.get_content()
        
        # Add creator info
        content["creator"] = "God's Zeal"
        content["endpoint"] = "/api/trending"
        
        return content
    except Exception as e:
        return {"error": str(e), "creator": "God's Zeal"}


async def fetch_homepage() -> dict:
    """Fetch homepage content from MovieBox API"""
    try:
        session = Session()
        homepage = Homepage(session)
        
        content = await homepage.get_content()
        
        # Add creator info
        content["creator"] = "God's Zeal"
        content["endpoint"] = "/api/homepage"
        
        return content
    except Exception as e:
        return {"error": str(e), "creator": "God's Zeal"}


async def fetch_popular_search() -> dict:
    """Fetch popular searches from MovieBox API"""
    try:
        session = Session()
        popular = PopularSearch(session)
        
        content = await popular.get_content()
        
        return {
            "creator": "God's Zeal",
            "endpoint": "/api/popular-search",
            "items": content,
        }
    except Exception as e:
        return {"error": str(e), "creator": "God's Zeal"}


async def fetch_search_suggestion(reference: str, per_page: int = 10) -> dict:
    """Fetch search suggestions from MovieBox API"""
    try:
        session = Session()
        suggestion = SearchSuggestion(session, per_page=per_page)
        
        content = await suggestion.get_content(reference)
        
        # Add creator info
        content["creator"] = "God's Zeal"
        content["endpoint"] = "/api/search-suggestion"
        
        return content
    except Exception as e:
        return {"error": str(e), "creator": "God's Zeal"}


async def fetch_item_details(item_id: str, item_type: str) -> dict:
    """Fetch detailed information about a specific item"""
    try:
        session = Session()
        
        # Construct the page URL
        page_url = f"/detail/{item_id}"
        
        if item_type.upper() == "MOVIE":
            details = MovieDetails(page_url, session)
        else:
            details = TVSeriesDetails(page_url, session)
        
        content = await details.get_content()
        
        # Add creator info
        content["creator"] = "God's Zeal"
        content["endpoint"] = "/api/item-details"
        
        return content
    except Exception as e:
        return {"error": str(e), "creator": "God's Zeal"}


async def fetch_downloads(subject_id: str, detail_path: str, season: int = 0, episode: int = 0) -> dict:
    """Fetch download links for a specific item"""
    try:
        session = Session()
        
        from moviebox_api.models import SearchResultsItem
        item = SearchResultsItem(subjectId=subject_id, detailPath=detail_path)
        
        downloads = DownloadableMovieFilesDetail(session, item) if season == 0 and episode == 0 else DownloadableTVSeriesFilesDetail(session, item)
        
        content = await downloads.get_content() if season == 0 and episode == 0 else await downloads.get_content(season, episode)
        
        return {
            "creator": "God's Zeal",
            "endpoint": "/api/downloads",
            "subjectId": subject_id,
            "detailPath": detail_path,
            "season": season,
            "episode": episode,
            "data": content,
        }
    except Exception as e:
        return {"error": str(e), "creator": "God's Zeal"}


async def fetch_subtitles(subject_id: str, detail_path: str, season: int = 0, episode: int = 0) -> dict:
    """Fetch available subtitles for a specific item"""
    try:
        session = Session()
        
        from moviebox_api.models import SearchResultsItem
        item = SearchResultsItem(subjectId=subject_id, detailPath=detail_path)
        
        downloads = DownloadableMovieFilesDetail(session, item) if season == 0 and episode == 0 else DownloadableTVSeriesFilesDetail(session, item)
        
        content = await downloads.get_content() if season == 0 and episode == 0 else await downloads.get_content(season, episode)
        
        subtitles = content.get('subtitles', content.get('captionFiles', []))
        
        return {
            "creator": "God's Zeal",
            "endpoint": "/api/subtitles",
            "subjectId": subject_id,
            "detailPath": detail_path,
            "season": season,
            "episode": episode,
            "data": {"subtitles": subtitles, "allData": content},
        }
    except Exception as e:
        return {"error": str(e), "creator": "God's Zeal"}


async def fetch_stream(subject_id: str, detail_path: str, season: int = 0, episode: int = 0) -> dict:
    """Fetch streaming links for a specific item"""
    try:
        session = Session()
        
        from moviebox_api.models import SearchResultsItem
        item = SearchResultsItem(subjectId=subject_id, detailPath=detail_path)
        
        stream = StreamFilesDetail(session, item)
        
        content = await stream.get_content(season, episode)
        
        return {
            "creator": "God's Zeal",
            "endpoint": "/api/stream",
            "subjectId": subject_id,
            "detailPath": detail_path,
            "season": season,
            "episode": episode,
            "data": content,
        }
    except Exception as e:
        return {"error": str(e), "creator": "God's Zeal"}


async def main():
    """Main entry point for the wrapper script"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided", "creator": "God's Zeal"}))
        return
    
    command = sys.argv[1]
    
    try:
        if command == "search":
            query = sys.argv[2] if len(sys.argv) > 2 else ""
            subject_type = sys.argv[3] if len(sys.argv) > 3 else "ALL"
            page = int(sys.argv[4]) if len(sys.argv) > 4 else 1
            per_page = int(sys.argv[5]) if len(sys.argv) > 5 else 24
            result = await fetch_search(query, subject_type, page, per_page)
        
        elif command == "trending":
            page = int(sys.argv[2]) if len(sys.argv) > 2 else 0
            per_page = int(sys.argv[3]) if len(sys.argv) > 3 else 18
            result = await fetch_trending(page, per_page)
        
        elif command == "homepage":
            result = await fetch_homepage()
        
        elif command == "popular-search":
            result = await fetch_popular_search()
        
        elif command == "search-suggestion":
            reference = sys.argv[2] if len(sys.argv) > 2 else ""
            per_page = int(sys.argv[3]) if len(sys.argv) > 3 else 10
            result = await fetch_search_suggestion(reference, per_page)
        
        elif command == "item-details":
            item_id = sys.argv[2] if len(sys.argv) > 2 else ""
            item_type = sys.argv[3] if len(sys.argv) > 3 else "MOVIE"
            result = await fetch_item_details(item_id, item_type)
        
        elif command == "downloads":
            subject_id = sys.argv[2] if len(sys.argv) > 2 else ""
            detail_path = sys.argv[3] if len(sys.argv) > 3 else ""
            season = int(sys.argv[4]) if len(sys.argv) > 4 else 0
            episode = int(sys.argv[5]) if len(sys.argv) > 5 else 0
            result = await fetch_downloads(subject_id, detail_path, season, episode)
        
        elif command == "subtitles":
            subject_id = sys.argv[2] if len(sys.argv) > 2 else ""
            detail_path = sys.argv[3] if len(sys.argv) > 3 else ""
            season = int(sys.argv[4]) if len(sys.argv) > 4 else 0
            episode = int(sys.argv[5]) if len(sys.argv) > 5 else 0
            result = await fetch_subtitles(subject_id, detail_path, season, episode)
        
        elif command == "stream":
            subject_id = sys.argv[2] if len(sys.argv) > 2 else ""
            detail_path = sys.argv[3] if len(sys.argv) > 3 else ""
            season = int(sys.argv[4]) if len(sys.argv) > 4 else 0
            episode = int(sys.argv[5]) if len(sys.argv) > 5 else 0
            result = await fetch_stream(subject_id, detail_path, season, episode)
        
        else:
            result = {"error": f"Unknown command: {command}", "creator": "God's Zeal"}
        
        print(json.dumps(result, default=str))
    
    except Exception as e:
        print(json.dumps({"error": str(e), "creator": "God's Zeal"}, default=str))


if __name__ == "__main__":
    asyncio.run(main())
