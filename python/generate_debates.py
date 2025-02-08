import json
from datetime import datetime
import os

class DebateManager:
    def __init__(self, json_path='../public/api/debates.json'):
        self.json_path = json_path
        self.ensure_directory_exists()
        # Initialize empty JSON file if it doesn't exist
        if not os.path.exists(self.json_path):
            with open(self.json_path, 'w') as f:
                json.dump([], f)
        self.debates = self.load_current_debates()

    def ensure_directory_exists(self):
        directory = os.path.dirname(self.json_path)
        if not os.path.exists(directory):
            os.makedirs(directory)

    def load_current_debates(self):
        try:
            with open(self.json_path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def update_debates(self, new_debates):
        """
        Update the debates.json file with new debate data
        
        new_debates should be a list of dictionaries with the format:
        [
            {
                "title": "Your Debate Title",
                "description": "yap",
                "topic": "Topic Category",
                "sentiment": 0.75  # value between 0 and 1
            },
            # ... more debates
        ]
        """
        formatted_debates = []
        for i, debate in enumerate(new_debates, 1):
            formatted_debate = {
                "id": i,
                "title": debate["title"],
                "date": f"Updated {datetime.now().strftime('%Y-%m-%d')}",
                "description": debate.get("description", "yap"),
                "topic": debate["topic"],
                "sentiment": debate["sentiment"],
                "isHotTopic": debate.get("isHotTopic", False)
            }
            formatted_debates.append(formatted_debate)
        
        self.debates = formatted_debates
        self.save_debates()
        print(f"Successfully updated debates.json with {len(formatted_debates)} debates")

    def add_debate(self, title, topic, sentiment, is_hot_topic=False):
        """Add a new debate or update existing one with the same title"""
        new_debate = {
            "id": len(self.debates) + 1,
            "title": title,
            "date": f"Updated {datetime.now().strftime('%Y-%m-%d')}",
            "description": "yap",
            "topic": topic,
            "sentiment": sentiment,
            "isHotTopic": is_hot_topic
        }

        # Update existing debate if title matches, otherwise add new
        for debate in self.debates:
            if debate["title"] == title:
                debate.update(new_debate)
                break
        else:
            self.debates.append(new_debate)

        self.save_debates()
        print(f"Added/Updated debate: {title}")

    def update_sentiment(self, title, new_sentiment):
        """Update sentiment for a specific debate"""
        for debate in self.debates:
            if debate["title"] == title:
                debate["sentiment"] = new_sentiment
                debate["date"] = f"Updated {datetime.now().strftime('%Y-%m-%d')}"
                break
        self.save_debates()
        print(f"Updated sentiment for: {title}")

    def save_debates(self):
        """Save current debates to JSON file"""
        with open(self.json_path, 'w') as f:
            json.dump(self.debates, f, indent=2)

# Example usage
if __name__ == "__main__":
    manager = DebateManager()

    # Example 1: Add individual debates
    manager.add_debate(
        title="Bitcoin's Role as Digital Gold",
        topic="Store of Value",
        sentiment=0.75,
        is_hot_topic=True
    )

    # Example 2: Bulk update debates
    sample_debates = [
        {
            "title": "Bitcoin's Role as Digital Gold",
            "topic": "Store of Value",
            "sentiment": 0.75,
            "isHotTopic": True
        },
        {
            "title": "Ethereum's Transition to PoS",
            "topic": "Consensus Mechanisms",
            "sentiment": 0.85
        },
        {
            "title": "Layer 2 vs Alternative L1s",
            "topic": "Scalability",
            "sentiment": 0.22,
            "isHotTopic": True
        }
    ]
    
    # Update all debates at once
    manager.update_debates(sample_debates)

    # Example 3: Update single sentiment
    manager.update_sentiment("Bitcoin's Role as Digital Gold", 0.80)

    # Add multiple debates
    debates = [
        {
            "title": "Bitcoin vs Ethereum",
            "topic": "Cryptocurrency",
            "sentiment": 0.75,
            "isHotTopic": True
        },
        {
            "title": "DeFi's Future",
            "topic": "DeFi",
            "sentiment": 0.85,
            "isHotTopic": True
        }
    ]

    print("Adding debates...")
    manager.update_debates(debates)
    print(f"Current path: {manager.json_path}")

    # Verify the contents
    with open(manager.json_path, 'r') as f:
        current_debates = json.load(f)
    print(f"Current debates in file: {current_debates}")