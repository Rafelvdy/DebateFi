import requests
import pandas as pd
import openai
from datetime import datetime, timedelta
import json
import re
import os
from dotenv import load_dotenv
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Load environment variables
load_dotenv()

# Your existing API key setup
openaikey = os.getenv("OPENAI_API_KEY")
twitterkey = os.getenv("TWITTER_API_KEY")

# Get current time and round down to nearest hour
current_time = datetime.now()

start_date = current_time.replace(minute=0, second=0, microsecond=0).strftime('%Y-%m-%d_%H:%M:%S_UTC')

# Add 1 hour to get the end date
start_datetime = datetime.strptime(start_date, '%Y-%m-%d_%H:%M:%S_%Z')
end_datetime = start_datetime + timedelta(hours=1)
end_date = end_datetime.strftime('%Y-%m-%d_%H:%M:%S_UTC')

#start_date = "2025-02-08_18:00:00_UTC"
#end_date = "2025-02-09_04:00:00_UTC"
# Generate hourly timestamps
hourly_timestamps = pd.date_range(start=start_date.replace("_", " "), 
                                  end=end_date.replace("_", " "), 
                                  freq='h')
print(f'Start date: {start_date}, End date: {end_date}')
# Format them back with underscores
formatted_timestamps = [ts.strftime('%Y-%m-%d_%H:%M:%S_UTC') for ts in hourly_timestamps]

min_replies = 50
min_likes = 500
min_retweets = 50


## TOP 100 CRYPTOS BY MARKETCAP WITH A FEW MANUAL EXCLUSIONS

crypto_tickers = top_100_cryptos = [
    "Bitcoin", "BTC",
    "Ethereum", "ETH",
    "Tether", "USDT",
    "XRP",]
'''
    "Solana", "SOL",
    "BNB",
    "USD Coin", "USDC",
    "Cardano", "ADA",
    "TRON", "TRX",
    "Chainlink", "LINK",
    "Stellar", "XLM",
    "Avalanche", "AVAX",
    "Sui",
    "Shiba Inu", "SHIB",
    "Litecoin", "LTC",
    "Polkadot", "DOT",
    "Polygon", "MATIC",
    "Wrapped Bitcoin", "WBTC",
    "Dai", "DAI",
    "Uniswap", "UNI",
    "Bitcoin Cash", "BCH",
    "LEO Token", "LEO",
    "Cosmos", "ATOM",
    "Toncoin", "TON",
    "Ethereum Classic", "ETC",
    "Monero", "XMR",
    "OKB", "OKB",
    "Filecoin", "FIL",
    "Internet Computer", "ICP",
    "Hedera", "HBAR",
    "Aptos", "APT",
    "Arbitrum", "ARB",
    "VeChain", "VET",
    "NEAR Protocol", "NEAR",
    "AAVE",
    "Algorand", "ALGO",
    "Maker", "MKR",
    "Render", "RNDR",
    "Optimism", "OP",
    "The Graph", "GRT",
    "Fantom", "FTM"
    "THORChain", "RUNE",
    "Stacks", "STX",
    "FLOW",
    "Quant", "QNT",
    "MultiversX", "EGLD",
    "Immutable", "IMX",
    "Chiliz", "CHZ",
    "Tezos", "XTZ",
    "Decentraland", "MANA",
    "Theta Network", "THETA",
    "Axie Infinity", "AXS",
    "Rocket Pool", "RPL",
    "Pax Dollar", "USDP",
    "Kava", "KAVA",
    "Injective", "INJ",
    "Curve DAO", "CRV",
    "Synthetix", "SNX",
    "Frax Share", "FXS",
    "EOS",
    "NEO",
    "Zilliqa", "ZIL",
    "IOTA", "MIOTA",
    "Helium", "HNT",
    "GALA",
    "DASH",
    "CELO",
    "Harmony", "ONE",
    "WAVES",
    "Loopring", "LRC",
    "Enjin Coin", "ENJ",
    "Holo", "HOT",
    "Decred", "DCR",
    "Siacoin", "SC",
    "BitTorrent", "BTT",
    "Lisk", "LSK",
    "AUDIO",
    "DigiByte", "DGB",
    "Nano", "XNO",
    "Ontology", "ONT",
    "ICON", "ICX",
    "SafePal", "SFP",
    "Livepeer", "LPT",
    "COTI",
    "STORJ",
    "ARK",
    "Numeraire", "NMR",
    "Verge", "XVG",
    "Radicle", "RAD",
    "SuperRare", "RARE",
]
'''

# OpenAI API Key
client = openai.OpenAI(api_key=openaikey)
# Datura API Key
API_KEY = twitterkey


## FETCH TWEETS


# Twitter API Endpoint
url = "https://apis.datura.ai/twitter"

# Headers for API authentication
headers = {
    "Authorization": f"{API_KEY}",
    "Content-Type": "application/json"
}

# Function to check if a tweet is from a bot
def is_bot(user):
    followers = user.get("followers_count", 0)
    statuses = user.get("statuses_count", 0)
    verified = user.get("verified", False)
    # Basic bot filter heuristics
    if followers < 10 or statuses < 5:  # Low activity accounts
        print("Is bot")
        return True
    if verified:  # Verified accounts are legit
        return False
    return False

# List to store all tweets
all_tweets = []

for end_date in formatted_timestamps[1:]:
    #print(f'Searching for tweets {start_datetime} to {end_datetime}')
    # Loop through each crypto ticker
    for ticker in crypto_tickers:
        print(f"Processing ticker: {ticker}")
        print(f"Current time window: {start_date} to {end_date}")
        #print(f"Fetching tweets for {ticker}...")

        # Define the search parameters
        payload = {
            "query": f"(${ticker} OR {ticker} OR {ticker.lower()} OR ${ticker.lower()})",
            "sort": "Latest",
            "start_date": start_date,
            "end_date": end_date,
            "lang": "en",
            "blue_verified": True,  # Fetch tweets from verified accounts
            "min_retweets": min_retweets,
            "min_replies": min_replies,
            "min_likes": min_likes
        }

        # Make API request
        response = requests.post(url, json=payload, headers=headers)
        #response = requests.request("POST", url, json=payload, headers=headers)

        #print(response.text)

        if response.status_code == 200:
            data = response.json()
            
            for tweet in data:
                user = tweet.get("user", {})
                
                # Filter out bots and enforce minimum thresholds
                if not is_bot(user) and \
                   tweet["like_count"] >= min_likes and \
                   tweet["retweet_count"] >= min_retweets and \
                   tweet["reply_count"] >= min_replies:
                    all_tweets.append({
                        "ticker": ticker,
                        "text": tweet["text"],
                        "created_at": tweet["created_at"],
                        "likes": tweet["like_count"],
                        "retweets": tweet["retweet_count"],
                        "replies": tweet["reply_count"],
                        "url": tweet["url"],
                        "user": user["username"],
                        "followers": user["followers_count"]
                    })

        print(f"Found {len(data)} tweets for {ticker}")

def process_tweet_with_openai(tweet_data):
    tweet_text = tweet_data['text']
    ticker = tweet_data['ticker']
    
    print(f"[*] Processing tweet for {ticker} with OpenAI")
    try:
        system_message = {
            "role": "system",
            "content": (
                "You are a sophisticated Crypto Twitter debate analysis tool, designed to extract the most informative and factual insights from high-engagement crypto discussions. Your focus is on:\n\n"
                
                "Extracting key points from debates, prioritising discussions on blockchain technology, token utilities, and innovations.\n"
                "Identifying the underlying narratives shaping the crypto market, including regulatory changes, partnerships, or tech upgrades.\n"
                "Evaluating the importance of each debate based on engagement metrics and the influence of the participants.\n"
                "Summarising both sides of arguments concisely, with emphasis on data-driven reasoning and technical comparisons.\n"
                "Detecting any **real-world events** that might have triggered the debate (such as news, announcements, or major transactions).\n\n"

                "You measure issue importance, influence of involved accounts, and stance of participants\n"
                "You provide clear info about debate participants on each side and their positions\n"
                "You detect underlying real-world events that may have triggered/influenced the debate, that are inferrable from the debate content\n"
                "You must be clear, concise, direct, and factual. Make your output as information dense as possible.\n\n"

                "**Important Guidelines:**\n"
                "- When referencing a crypto token ticker, it should always be the ticker symbol with letters only and should never contain numbers.\n"
                "- Keep your responses concise but **rich in insights**. Do not add unnecessary fluff.\n"
                "- Focus on **data, metrics, and technological impact** rather than emotions or generic opinions.\n"
                "- Use **quotes from key participants** only when they add value to the analysis.\n"
                "- Highlight **innovations, tokenomics, scalability, security features, or protocol updates** if discussed.\n"
                "- If no technical details are mentioned, infer broader **market sentiment trends** from the debate.\n"
                "- First verify the tweet actually discusses the specified crypto token. If it does not, respond with 'INVALID'.\n"
                "- Ignore tweets that are spam, advertisements, or unrelated content\n"
            )
        }
        
        df_summaries = pd.DataFrame(columns=['Summary'])
        
        # Process the single tweet
        user_message = {
            "role": "user",
            "content": (
                f"This is the twitter debate we are analysing: {tweet_text}\n"
                f"""Please format your response in the following example format. Do not title each section, only include the output:\n\n

                Insert here an explanation of what the debate is and the underlying narrative, summarised in 20 words or less.\n\n
                 
                Insert here an explanation of Explanation of why the debate is important, mentioning any real-world events, tech advancements, or market trends that may have triggered it.\n\n
                
                Insert here a detailed breakdown of both sides of the argument, including key figures, positions, and relevant quotes, including any notable participant's names. Make this 100-200 words and include appropriate quotes from notable users where appropriate.\n\n

                Insert here a score of how bearish to bullish the sentiment is on the ticker discussed on a scale from 1 (bearish) to 100 (bullish). Format this line as "Crypto Token Ticker" "Score/100"\n\n

                Insert here the total engagement on the post. Format this line as "Likes: (number of likes), Retweets: (number of retweets), Replies: (number of replies)"\n\n

                Insert here the url link to the original tweet\n\n

                Insert here the datetime that the original tweet was made at in the format "Time: (Datetime)"\n\n\n
                """
            )
        }

        # Create the completion request inside the loop
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[system_message, user_message],
            temperature=0.5
        )

        # Extract message content
        message_content = completion.choices[0].message.content
        
        # Skip invalid responses
        if message_content.strip().upper() == 'INVALID':
            return None

        # Convert to DataFrame and append to the main DataFrame
        new_row = pd.DataFrame({'Summary': [message_content]})
        df_summaries = pd.concat([df_summaries, new_row], ignore_index=True)

        return {
            "ticker": ticker,
            "summary": message_content.split("\n\n")[0].strip() if message_content else "",
            "reason": message_content.split("\n\n")[1].strip() if message_content else "",
            "analysis": message_content.split("\n\n")[2].strip() if message_content else "",
            "rating": message_content.split("\n\n")[3].strip() if message_content else "N/A",
            "likes": tweet_data['likes'],
            "retweets": tweet_data['retweets'], 
            "replies": tweet_data['replies'],
            "url": tweet_data['url'],
            "time": tweet_data['created_at']
        }
    except Exception as e:
        print(f"[-] Error processing tweet for {ticker}: {str(e)}")
        raise e

# Read existing data
debates_path = "public/api/debates.json"
try:
    with open(debates_path, "r", encoding="utf-8") as file:
        existing_data = json.load(file)
except (FileNotFoundError, json.JSONDecodeError):
    existing_data = {"data": {}}

# Process fetched tweets
processed_debates = []
for tweet in all_tweets:
    try:
        analysis = process_tweet_with_openai(tweet)
        if analysis:
            processed_debates.append(analysis)
    except Exception as e:
        print(f"[-] Failed to process tweet: {str(e)}")
        continue

# Modify the file saving to use your existing paths
debates_file = os.path.join(project_root, "public", "api", "debates.json")

# When saving the JSON, use your existing file structure
if processed_debates:
    next_index = len(existing_data['data'])
    for debate in processed_debates:
        existing_data['data'][str(next_index)] = {"data": debate}
        next_index += 1

    # Save to your existing debates.json location
    with open(debates_file, "w", encoding="utf-8") as json_file:
        json.dump(existing_data, json_file, indent=4, ensure_ascii=False)
    print(f"[*] Writing {len(processed_debates)} debates to {debates_file}")
else:
    print("No new unique debates to add")