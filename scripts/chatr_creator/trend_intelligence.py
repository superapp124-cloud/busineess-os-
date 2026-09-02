import sys
import json
import time
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
from typing import List, Optional
import argparse
import random

@dataclass
class TrendSignal:
    topic: str
    source: str
    timestamp: str
    velocity: str
    search_signal: int
    social_signal: int
    freshness_hours: float
    category: str
    content_opportunity: str
    audience_fit: int
    source_url: str

def infer_category(topic: str) -> str:
    topic_lower = topic.lower()
    if any(k in topic_lower for k in ['cricket', 'ipl', 'football', 'tennis', 'match', 'kohli', 'dhoni']):
        return 'sports'
    if any(k in topic_lower for k in ['film', 'movie', 'ott', 'actor', 'actress', 'bollywood', 'cinema', 'shah rukh', 'salman', 'trailer']):
        return 'entertainment'
    if any(k in topic_lower for k in ['bjp', 'congress', 'election', 'modi', 'minister', 'govt', 'government', 'sc']):
        return 'politics'
    if any(k in topic_lower for k in ['ai', 'tech', 'apple', 'google', 'microsoft', 'phone', 'launch', 'app']):
        return 'technology'
    if any(k in topic_lower for k in ['song', 'singer', 'album', 'music', 'concert']):
        return 'music'
    if any(k in topic_lower for k in ['meme', 'joke', 'funny', 'viral', 'troll']):
        return 'humour'
    if any(k in topic_lower for k in ['story', 'hero', 'save', 'life', 'people', 'human']):
        return 'human_story'
    return 'india'

def infer_content_opportunity(category: str) -> str:
    mapping = {
        'sports': 'reaction',
        'entertainment': 'storytime',
        'politics': 'explainer',
        'technology': 'news_breakdown',
        'music': 'reaction',
        'humour': 'humour',
        'human_story': 'storytime',
        'india': 'news_breakdown'
    }
    return mapping.get(category, 'explainer')

def determine_velocity(freshness_hours: float) -> str:
    if freshness_hours < 2:
        return 'TRENDING_NOW'
    if freshness_hours < 24:
        return 'TODAY'
    if freshness_hours < 168:
        return 'WEEK'
    return 'EVERGREEN'

def fetch_rss(url: str) -> Optional[ET.Element]:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'chatr-trend-engine/1.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            return ET.fromstring(response.read())
    except Exception as e:
        print(f"Error fetching RSS {url}: {e}", file=sys.stderr)
        return None

def fetch_json(url: str) -> Optional[dict]:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'chatr-trend-engine/1.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read())
    except Exception as e:
        print(f"Error fetching JSON {url}: {e}", file=sys.stderr)
        return None

def get_google_trends_india() -> List[TrendSignal]:
    url = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN"
    root = fetch_rss(url)
    trends = []
    if root is None:
        return trends
    
    # XML namespace for approx_traffic
    namespaces = {'ht': 'https://trends.google.com/trends/trendingsearches/daily'}
    
    for item in root.findall('.//item'):
        title = item.find('title')
        traffic_elem = item.find('ht:approx_traffic', namespaces)
        pub_date_elem = item.find('pubDate')
        link_elem = item.find('link')
        
        if title is not None:
            topic = title.text
            traffic_str = traffic_elem.text if traffic_elem is not None else "0"
            traffic_str = traffic_str.replace('+', '').replace(',', '').replace('K', '000').replace('M', '000000')
            try:
                traffic = int(traffic_str)
                search_signal = min(100, int(traffic / 10000))
            except:
                search_signal = 50
                
            pub_date = pub_date_elem.text if pub_date_elem is not None else ""
            freshness_hours = 12.0
            if pub_date:
                try:
                    # Format: Thu, 31 Aug 2026 08:00:00 +0530
                    dt = datetime.strptime(pub_date, "%a, %d %b %Y %H:%M:%S %z")
                    now = datetime.now(timezone.utc)
                    freshness_hours = (now - dt).total_seconds() / 3600.0
                except:
                    pass
            
            category = infer_category(topic)
            trends.append(TrendSignal(
                topic=topic,
                source='google_trends',
                timestamp=datetime.now(timezone.utc).isoformat(),
                velocity=determine_velocity(freshness_hours),
                search_signal=search_signal,
                social_signal=50,
                freshness_hours=max(0.1, freshness_hours),
                category=category,
                content_opportunity=infer_content_opportunity(category),
                audience_fit=90,
                source_url=link_elem.text if link_elem is not None else url
            ))
    return trends

def get_google_news_india() -> List[TrendSignal]:
    url = "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
    root = fetch_rss(url)
    trends = []
    if root is None:
        return trends
        
    for item in root.findall('.//item')[:15]:
        title = item.find('title')
        pub_date_elem = item.find('pubDate')
        link_elem = item.find('link')
        
        if title is not None:
            topic = title.text
            pub_date = pub_date_elem.text if pub_date_elem is not None else ""
            freshness_hours = 6.0
            if pub_date:
                try:
                    dt = datetime.strptime(pub_date, "%a, %d %b %Y %H:%M:%S %Z")
                    now = datetime.now(timezone.utc)
                    freshness_hours = (now - dt.replace(tzinfo=timezone.utc)).total_seconds() / 3600.0
                except:
                    pass
            
            category = infer_category(topic)
            trends.append(TrendSignal(
                topic=topic,
                source='google_news',
                timestamp=datetime.now(timezone.utc).isoformat(),
                velocity=determine_velocity(freshness_hours),
                search_signal=70,
                social_signal=60,
                freshness_hours=max(0.1, freshness_hours),
                category=category,
                content_opportunity=infer_content_opportunity(category),
                audience_fit=80,
                source_url=link_elem.text if link_elem is not None else url
            ))
    return trends

def get_reddit_india(subreddit: str) -> List[TrendSignal]:
    url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit=10"
    data = fetch_json(url)
    trends = []
    if not data or 'data' not in data or 'children' not in data['data']:
        return trends
        
    for child in data['data']['children']:
        post = child['data']
        topic = post.get('title', '')
        score = post.get('score', 0)
        upvote_ratio = post.get('upvote_ratio', 0.5)
        created_utc = post.get('created_utc', 0)
        
        freshness_hours = 12.0
        if created_utc:
            now = datetime.now(timezone.utc).timestamp()
            freshness_hours = (now - created_utc) / 3600.0
            
        social_signal = min(100, int((score / 1000) * upvote_ratio * 100))
        if social_signal == 0:
            social_signal = int(upvote_ratio * 100)
            
        category = infer_category(topic)
        # override for specific subreddits
        if subreddit == 'bollywood':
            category = 'entertainment'
        elif subreddit == 'cricket':
            category = 'sports'
            
        trends.append(TrendSignal(
            topic=topic,
            source=f'reddit_{subreddit}',
            timestamp=datetime.now(timezone.utc).isoformat(),
            velocity=determine_velocity(freshness_hours),
            search_signal=40,
            social_signal=social_signal,
            freshness_hours=max(0.1, freshness_hours),
            category=category,
            content_opportunity=infer_content_opportunity(category),
            audience_fit=75,
            source_url=f"https://reddit.com{post.get('permalink', '')}"
        ))
    return trends

def get_gdelt() -> List[TrendSignal]:
    url = "https://api.gdeltproject.org/api/v2/doc/doc?query=india&mode=artlist&maxrecords=10&format=json"
    data = fetch_json(url)
    trends = []
    if not data or 'articles' not in data:
        return trends
        
    for art in data['articles']:
        topic = art.get('title', '')
        if not topic:
            continue
            
        category = infer_category(topic)
        trends.append(TrendSignal(
            topic=topic,
            source='gdelt',
            timestamp=datetime.now(timezone.utc).isoformat(),
            velocity='TODAY',
            search_signal=50,
            social_signal=40,
            freshness_hours=12.0,
            category=category,
            content_opportunity=infer_content_opportunity(category),
            audience_fit=60,
            source_url=art.get('url', url)
        ))
    return trends

def get_all_trends() -> dict:
    sources = {
        'google_trends': get_google_trends_india,
        'google_news': get_google_news_india,
        'reddit_india': lambda: get_reddit_india('india'),
        'reddit_bollywood': lambda: get_reddit_india('bollywood'),
        'reddit_cricket': lambda: get_reddit_india('cricket'),
        'gdelt': get_gdelt
    }
    
    results = {}
    for name, func in sources.items():
        try:
            trends = func()
            results[name] = trends
        except Exception as e:
            print(f"Failed source {name}: {e}", file=sys.stderr)
            results[name] = []
            
    return results

def get_content_batch(n=20) -> List[TrendSignal]:
    all_trends_dict = get_all_trends()
    all_trends = []
    for trends in all_trends_dict.values():
        all_trends.extend(trends)
        
    if not all_trends:
        # FALLBACK
        fallback = TrendSignal(
            topic="Top Evergreen Indian Culture Facts",
            source="FALLBACK",
            timestamp=datetime.now(timezone.utc).isoformat(),
            velocity="EVERGREEN",
            search_signal=50,
            social_signal=50,
            freshness_hours=999.0,
            category="human_story",
            content_opportunity="storytime",
            audience_fit=100,
            source_url=""
        )
        return [fallback] * n
        
    # Group by category
    by_category = {}
    for t in all_trends:
        by_category.setdefault(t.category, []).append(t)
        
    # Mix: 4 current trends, 3 humour, 3 music/culture, 3 india/current_affairs, 2 sports, 2 entertainment, 1 tech, 1 fact, 1 human_story
    # (Total = 20)
    # We will map these requirements to available categories
    reqs = [
        ('india', 4), # current trends mapping
        ('humour', 3),
        ('music', 3),
        ('india', 3),
        ('sports', 2),
        ('entertainment', 2),
        ('technology', 1),
        ('human_story', 1), # fact
        ('human_story', 1)
    ]
    
    batch = []
    for cat, count in reqs:
        available = by_category.get(cat, [])
        for _ in range(count):
            if available:
                t = random.choice(available)
                batch.append(t)
                available.remove(t)
            else:
                if all_trends:
                    batch.append(random.choice(all_trends))
                    
    return batch[:n]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--region", type=str)
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--batch", type=int)
    
    args = parser.parse_args()
    
    if args.self_test:
        print("Running self-test for Trend Engine...")
        results = get_all_trends()
        total = 0
        for source, trends in results.items():
            count = len(trends)
            total += count
            status = "SUCCESS" if count > 0 else "FAILED"
            print(f"Source: {source:<20} | Status: {status} | Trends: {count}")
            
        if total == 0:
            print("ERROR: All sources returned 0 trends.", file=sys.stderr)
            sys.exit(1)
        else:
            print(f"Self-test passed! Total trends fetched: {total}")
            sys.exit(0)
            
    elif args.batch:
        batch = get_content_batch(args.batch)
        print(json.dumps([asdict(t) for t in batch], indent=2))
        
    elif args.region:
        all_trends_dict = get_all_trends()
        all_trends = []
        for trends in all_trends_dict.values():
            all_trends.extend(trends)
            
        # sort by freshness and social signal
        all_trends.sort(key=lambda t: (t.freshness_hours, -t.social_signal))
        
        limit = args.limit
        print(json.dumps([asdict(t) for t in all_trends[:limit]], indent=2))
    
    else:
        parser.print_help()
