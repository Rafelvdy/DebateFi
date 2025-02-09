import requests
import pandas as pd
import openai
from datetime import datetime, timedelta
import json
import re

# Get current time and round down to nearest hour
current_time = datetime.now()
'''
start_date = current_time.replace(minute=0, second=0, microsecond=0).strftime('%Y-%m-%d_%H:%M:%S_UTC')

# Add 1 hour to get the end date
start_datetime = datetime.strptime(start_date, '%Y-%m-%d_%H:%M:%S_%Z')
end_datetime = start_datetime + timedelta(hours=1)
end_date = end_datetime.strftime('%Y-%m-%d_%H:%M:%S_UTC')
'''
start_date = "2025-02-08_18:00:00_UTC"
end_date = "2025-02-09_04:00:00_UTC"
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
    "XRP",
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
    "Fantom", "FTM"]
'''
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
        #print(f"Fetching tweets for {ticker}...")

        # Define the search parameters
        payload = {
            "query": f"(${ticker} OR {ticker} OR {ticker.lower()} OR ${ticker.lower()})",# min_replies:{min_replies} min_faves:{min_likes} min_retweets:{min_retweets} lang:en verified: True since:{start_date} until:{end_date}",
            "sort": "Latest",  # Can be "Latest" or "Top"
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
                
                # Filter out bots
                if not is_bot(user):
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
        
        else:
            print(f"Error fetching tweets for {ticker}: {response.status_code}")
            
    start_date = end_date



# Convert to DataFrame
df = pd.DataFrame(all_tweets)
df = df[(df["retweets"] >= min_retweets) & (df["replies"] > min_replies) & (df["likes"] > min_likes)]
df = df[~df["text"].str.contains(r'\b(?:free|giveaway)\b', case=False, na=False)]


df_2 = df


## FETCH REPLIES FOR SELECT TWEETS FROM SELECT ACCOUNTS


print('Fetching replies')
# Function to fetch replies for each tweet
def fetch_replies(tweet_id):
    replies_list = []
    
    payload = {
        "query": f"conversation_id:{tweet_id} -is:retweet lang:en",
        "sort": "Latest",
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        reply_data = response.json()
        for reply in reply_data:
            user = reply.get("user", {})
            if user.get("followers_count", 0) > 100:  # Only from notable accounts
                replies_list.append({
                    "text": reply["text"],
                    "created_at": reply["created_at"],
                    "likes": reply["like_count"],
                    "retweets": reply["retweet_count"],
                    "user": user["username"],
                    "followers": user["followers_count"]
                })
    else:
        print(f"Error fetching replies for tweet {tweet_id}: {response.status_code}")

    return replies_list

# Add Replies column to DataFrame
df_2["Replies"] = df_2["url"].apply(lambda x: fetch_replies(x.split("/")[-1]))  # Extract tweet ID from URL
# Delete debates with no useful replies
df_2 = df_2[df_2["Replies"].astype(str) != "[]"]


## GENERATE DATA SUMMARY INTO INTERPRETABLE FORMAT FOR OPENAI API


print('Converting into format for openai')
# Function to generate debate summaries
def generate_debate_summaries(df_2):
    summaries = []

    for _, row in df_2.iterrows():
        tweet_text = row["text"]
        user = row["user"]
        followers = row["followers"]
        likes = row["likes"]
        retweets = row["retweets"]
        replies_count = row["replies"]
        url = row["url"]
        date = row["created_at"]
        ticker = row["ticker"]
        # Original datetime string
        date_str = date
        # Convert to datetime object (ignoring timezone offset)
        strip_date = datetime.strptime(date_str, "%a %b %d %H:%M:%S %z %Y")
        # Convert back to a cleaner string format
        clean_date = strip_date.strftime("%Y-%m-%d %H:%M:%S")

        replies_list = row.get("Replies", [])

        total_reply_likes = sum(reply["likes"] for reply in replies_list)
        total_reply_retweets = sum(reply["retweets"] for reply in replies_list)
        total_reply_count = len(replies_list)

        formatted_replies = [
            f"User: {reply['user']} (Followers: {reply['followers']}): {reply['text']}"
            for reply in replies_list
        ]

        summary = (
            f"Here is the tweet that sparked debate: \"{tweet_text}\" by {user} "
            f"(Followers: {followers}). It received {likes} likes, {retweets} retweets, "
            f"and {replies_count} replies.\n\n"
            f"The link to the original tweet is {url}.\n"
            f"The tweet was about the crypto token ticker {ticker}.\n"
            f"The original tweet was made at the at datetime: {clean_date}.\n"
            f"This tweet has a total of {total_reply_count} replies, "
            f"which accumulated {total_reply_likes} likes and {total_reply_retweets} retweets in total.\n\n"
            f"Here are the notable replies:\n" +
            "\n".join(formatted_replies) + "\n"
        )

        summaries.append(summary)

    return summaries

# Generate summaries
debate_summaries = generate_debate_summaries(df_2)


## OPENAI API INTEGRATION TO SUMMARISE


print('Summarising with openai')
system_message = {
      "role": "system",
      "content": (
          "You are a sophisticated Crypto Twitter debate analysis tool, designed to extract the most informative and factual insights from high-engagement crypto discussions. Your focus is on:\n\n"
          
          "Extracting key points from debates, prioritising discussions on blockchain technology, token utilities, and innovations.\n"
          "Identifying the underlying narratives shaping the crypto market, including regulatory changes, partnerships, or tech upgrades.\n"
          "Evaluating the importance of each debate based on engagement metrics and the influence of the participants.\n"
          "Summarising both sides of arguments concisely, with emphasis on data-driven reasoning and technical comparisons.\n"
          "Detecting any **real-world events** that might have triggered the debate (such as news, announcements, or major transactions).\n"

          "You measure issue importance, influence of involved accounts, and stance of participants\n"
          "You provide clear info about debate participants on each side and their positions\n"
          "You detect underlying real-world events that may have triggered/influenced the debate, that are inferrable from the debate content\n"
          "You must be clear, concise, direct, and factual. Make your output as information dense as possible.\n"

          "**Important Guidelines:**\n"
          "- When referecing a crypto token ticker, it should always be the ticker symbol with letters onlyand should never contain numbers.\n"
          "- Keep your responses concise but **rich in insights**. Do not add unnecessary fluff.\n"
          "- Focus on **data, metrics, and technological impact** rather than emotions or generic opinions.\n"
          "- Use **quotes from key participants** only when they add value to the analysis.\n"
          "- Highlight **innovations, tokenomics, scalability, security features, or protocol updates** if discussed.\n"
          "- If no technical details are mentioned, infer broader **market sentiment trends** from the debate.\n"
          
      )
  }

df_summaries = pd.DataFrame(columns=['Summary'])

for debate in debate_summaries:
  
    user_message = {
        "role": "user",
        "content": (
            f"This is the twitter debate we are analysing: {debate}\n"
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
        model="gpt-4o-mini",  # Ensure the correct model name
        messages=[system_message, user_message],
        temperature=0.5
    )

    # Extract message content
    message_content = completion.choices[0].message.content
    
    # Convert to DataFrame and append to the main DataFrame
    new_row = pd.DataFrame({'Summary': [message_content]})
    df_summaries = pd.concat([df_summaries, new_row], ignore_index=True)


## CONVERT TO JSON


print('Output to json')
# Function to extract ticker and rating
def extract_data(summary):
    ticker_match = re.search(r'\$(\w+)|Ticker: (\w+)', summary)  # Find ticker
    rating_match = re.search(r'(\d+)/100', summary)  # Find rating
    likes_match = re.search(r'Likes: (\d+)', summary)  # Find Likes
    retweets_match = re.search(r'Retweets: (\d+)', summary)  # Find Retweets
    replies_match = re.search(r'Replies: (\d+)', summary)  # Find Replies
    url_match = re.search(r'(https://x\.com/\S+)', summary)  # Find URL
    time_match = re.search(r'Time: (.+)$', summary, re.MULTILINE)  # Find timestamp

    ticker = ticker_match.group(1) if ticker_match else "N/A"
    rating = rating_match.group(1) if rating_match else "N/A"
    likes = int(likes_match.group(1)) if likes_match else 0
    retweets = int(retweets_match.group(1)) if retweets_match else 0
    replies = int(replies_match.group(1)) if replies_match else 0
    url = url_match.group(1) if url_match else "N/A"
    time_str = time_match.group(1) if time_match else "N/A"

    # Convert time to a cleaner format if it exists
    try:
        time_clean = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%d %H:%M:%S")
    except ValueError:
        time_clean = "N/A"

    return ticker, rating, likes, retweets, replies, url, time_clean

# Transform DataFrame into the required format
output_dict = {}

for index, row in df_summaries.iterrows():
    ticker, rating, likes, retweets, replies, url, time_clean = extract_data(row["Summary"])
    parts = row["Summary"].split("\n\n", maxsplit=3)  # Split into parts
    
    output_dict[index] = {
        "data": {
            "ticker": ticker,
            "summary": parts[0] if len(parts) > 0 else "",
            "reason": parts[1] if len(parts) > 1 else "",
            "analysis": parts[2] if len(parts) > 2 else "",
            "rating": f"{rating}/100" if rating != "N/A" else "N/A",
            "likes": likes,
            "retweets": retweets,
            "replies": replies,
            "url": url,
            "time": time_clean,
        },
    }

# Before saving the new JSON data, load existing data and check for duplicates
try:
    with open("public/api/debates.json", "r", encoding="utf-8") as existing_file:
        existing_data = json.load(existing_file)
        existing_summaries = {item['data']['summary'] for item in existing_data['data'].values()}
except (FileNotFoundError, json.JSONDecodeError):
    existing_data = {"data": {}}
    existing_summaries = set()

# Filter out duplicates from new data
filtered_output_dict = {
    k: v for k, v in output_dict.items() 
    if v['data']['summary'] not in existing_summaries
}

# Merge with existing data if there are new entries
if filtered_output_dict:
    next_index = len(existing_data['data'])
    for k, v in filtered_output_dict.items():
        existing_data['data'][str(next_index)] = v
        next_index += 1

    # Save merged data
    with open("public/api/debates.json", "w", encoding="utf-8") as json_file:
        json.dump(existing_data, json_file, indent=4, ensure_ascii=False)
    print("New debates added to existing data")
else:
    print("No new unique debates to add")

# Define the file path where you want to save the JSON data
output_file_path = "output.json"

# Save JSON to a file
with open(output_file_path, "w", encoding="utf-8") as json_file:
    json.dump(output_dict, json_file, indent=4, ensure_ascii=False)

print(f"JSON data successfully saved to {output_file_path}")
