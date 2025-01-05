# scrape tweets

# instructions: https://blog.apify.com/how-to-scrape-tweets-and-more-on-twitter-59330e6fb522/#:~:text=To%20scrape%20tweets%20from%20a,with%20a%20public%20account%20zelenskyyua%20.

# in terminal: pip install twikit pandas

from twikit import Client
import json
import pandas as pd
import asyncio

client = Client('en-US')

client.login(auth_info_1='khy236khy236', password='#Nerak2328')
client.save_cookies('cookies.json')
client.load_cookies(path='cookies.json')

user = client.get_user_by_screen_name('zelenskyyua')
tweets = user.get_tweets('Tweets', count=5)

print(tweets)

client.search_tweet('python', 'Latest')


