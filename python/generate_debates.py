import requests
import pandas as pd
import openai
from datetime import datetime, timedelta
import json
import re
import os

print("Starting script...")
print(f"Current working directory: {os.getcwd()}")

start_date = '2025-02-07_22:00:01_UTC'
# Convert start_date string to datetime object
start_datetime = datetime.strptime(start_date, '%Y-%m-%d_%H:%M:%S_%Z')
# Add 1 hour to get the end date
end_datetime = start_datetime + timedelta(hours=1)
# Convert back to string in the same format
end_date = end_datetime.strftime('%Y-%m-%d_%H:%M:%S_UTC')

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
    "XRP", "XRP",
    "Solana", "SOL",
    "BNB", "BNB",
    "USD Coin", "USDC",
    "Cardano", "ADA",
    "TRON", "TRX",
    "Chainlink", "LINK",
    "Stellar", "XLM",
    "Avalanche", "AVAX",
    "Sui", "SUI",
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
    "Aave", "AAVE",
    "Algorand", "ALGO",
    "Maker", "MKR",
    "Render", "RNDR",
    "Optimism", "OP",
    "The Graph", "GRT",
    "Fantom", "FTM",
    "THORChain", "RUNE",
    "Stacks", "STX",
    "Flow", "FLOW",
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
    "EOS", "EOS",
    "Neo", "NEO",
    "Zilliqa", "ZIL",
    "IOTA", "MIOTA",
    "Helium", "HNT",
    "Gala", "GALA",
    "Dash", "DASH",
    "Celo", "CELO",
    "Harmony", "ONE",
    "Waves", "WAVES",
    "Loopring", "LRC",
    "Enjin Coin", "ENJ",
    "Holo", "HOT",
    "Decred", "DCR",
    "Siacoin", "SC",
    "BitTorrent", "BTT",
    "Lisk", "LSK",
    "Audius", "AUDIO",
    "DigiByte", "DGB",
    "Nano", "XNO",
    "Ontology", "ONT",
    "ICON", "ICX",
    "SafePal", "SFP",
    "Livepeer", "LPT",
    "COTI", "COTI",
    "Storj", "STORJ",
    "Ark", "ARK",
    "Numeraire", "NMR",
    "Verge", "XVG",
    "Radicle", "RAD",
    "SuperRare", "RARE",
]


print("Loading API keys...")
# OpenAI API Key
client = openai.OpenAI(api_key="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")
# Datura API Key
API_KEY = "dt_$44-mkIw_pnkjUohDIq9jNDWiBsD6nEyPX8QHQ03vbY4"


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

print("Starting to fetch tweets...")
for end_date in formatted_timestamps[1:]:
    print(f'Searching for tweets {start_date} to {end_date}')
    # Loop through each crypto ticker
    for ticker in crypto_tickers:
        print(f"Fetching tweets for {ticker}...")
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

print(f"Found {len(all_tweets)} total tweets")


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
          "You are an analysis tool that identifies debates and conflicts between influential Crypto Twitter accounts\n"
          "You measure issue importance, influence of involved accounts, and stance of participants\n"
          "You generate detailed summaries of debates including main points, arguments of both sides, and underlying narratives\n"
          "You provide clear info about debate participants on each side and their positions\n"
          "You detect underlying real-world events that may have triggered/influenced the debate, that are inferrable from the debate content\n"
          "You must be clear, concise, direct, and factual. Make your output as information dense as possible.\n"
          
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
           
          Insert here an explanation of how important the debate is, why the debate is important, and any real-world events that may have triggered the debate that are inferrable from the debate content.\n\n
          
          Insert here a summary of both sides of the argument including any notable participant's names:\n\n

          Insert here a score of how bearish to bullish the sentiment is on the ticker discussed on a scale from 1 (bearish) to 100 (bullish). Format this line as "Ticker" "Score/100"\n\n\n
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

print(f"Processed {len(df_summaries)} summaries")


## CONVERT TO JSON


print('Output to json')
# Function to extract ticker and rating
def extract_ticker_and_rating(summary):
    ticker_match = re.search(r'\$(\w+)|Ticker: (\w+)', summary)  # Find ticker
    rating_match = re.search(r'(\d+)/100', summary)  # Find rating

    ticker = ticker_match.group(1) if ticker_match else "N/A"
    rating = rating_match.group(1) if rating_match else "N/A"
    
    return ticker, rating

# Transform DataFrame into the required format
output_dict = {}

for index, row in df_summaries.iterrows():
    ticker, rating = extract_ticker_and_rating(row["Summary"])
    parts = row["Summary"].split("\n\n", maxsplit=3)  # Split into parts
    
    output_dict[index] = {
        "data": {
            "ticker": ticker,
            "summary": parts[0] if len(parts) > 0 else "",
            "reason": parts[1] if len(parts) > 1 else "",
            "analysis": parts[2] if len(parts) > 2 else "",
            "rating": f"{rating}/100" if rating != "N/A" else "N/A",
        },
    }

# Convert to JSON
json_output = json.dumps(output_dict, indent=4)

# Print JSON output
print(json_output)

# Define the file path where you want to save the JSON data
output_file_path = "../public/api/debates.json"  # Use relative path to save in correct location

# Before saving the JSON file
print(f"Attempting to save to: {os.path.abspath(output_file_path)}")
try:
    # Create directories if they don't exist
    os.makedirs(os.path.dirname(os.path.abspath(output_file_path)), exist_ok=True)
    
    with open(output_file_path, "w", encoding="utf-8") as json_file:
        json.dump(output_dict, json_file, indent=4, ensure_ascii=False)
    print(f"Successfully saved JSON with {len(output_dict)} entries")
    print(f"File exists after save: {os.path.exists(output_file_path)}")
except Exception as e:
    print(f"Error saving JSON: {str(e)}")

input("Press Enter to exit...")