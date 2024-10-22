import os
import sys
import time
import requests
import argparse
import json
from requests_oauthlib import OAuth1

MEDIA_ENDPOINT_URL = 'https://upload.twitter.com/1.1/media/upload.json'

def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description='Upload video to Twitter.')
    parser.add_argument('--consumer_key', required=True, help='Twitter API Consumer Key')
    parser.add_argument('--consumer_secret', required=True, help='Twitter API Consumer Secret')
    parser.add_argument('--access_token', required=True, help='Twitter API Access Token')
    parser.add_argument('--access_token_secret', required=True, help='Twitter API Access Token Secret')
    parser.add_argument('--video_filename', required=True, help='Path to the video file to upload')
    return parser.parse_args()

class VideoTweet:
    def __init__(self, file_name, oauth):
        """Initialize video tweet properties."""
        self.video_filename = file_name
        self.total_bytes = os.path.getsize(self.video_filename)
        self.media_id = None
        self.processing_info = None
        self.oauth = oauth
        self.successful = False
        self.logs = []  # Collect logs for the result JSON

    def log(self, message):
        """Add a message to the logs."""
        # print(message)  # Optional: print to console for real-time feedback
        self.logs.append(message)

    def upload_init(self):
        """Initialize the upload."""
        self.log('INIT')
        request_data = {
            'command': 'INIT',
            'media_type': 'video/mp4',
            'total_bytes': self.total_bytes,
            'media_category': 'tweet_video'
        }
        req = requests.post(url=MEDIA_ENDPOINT_URL, data=request_data, auth=self.oauth)
        self.media_id = req.json()['media_id']
        self.log(f'Media ID: {self.media_id}')

    def upload_append(self):
        """Upload media in chunks."""
        segment_id = 0
        bytes_sent = 0
        with open(self.video_filename, 'rb') as file:
            while bytes_sent < self.total_bytes:
                chunk = file.read(4 * 1024 * 1024)
                self.log('APPEND')
                request_data = {
                    'command': 'APPEND',
                    'media_id': self.media_id,
                    'segment_index': segment_id
                }
                files = {'media': chunk}
                req = requests.post(url=MEDIA_ENDPOINT_URL, data=request_data, files=files, auth=self.oauth)

                if not (200 <= req.status_code < 300):
                    self.log(f"Error {req.status_code}: {req.text}")
                    sys.exit(0)

                segment_id += 1
                bytes_sent = file.tell()
                self.log(f'{bytes_sent} of {self.total_bytes} bytes uploaded')

        self.log('Upload chunks complete.')

    def upload_finalize(self):
        """Finalize the upload."""
        self.log('FINALIZE')
        request_data = {'command': 'FINALIZE', 'media_id': self.media_id}
        req = requests.post(url=MEDIA_ENDPOINT_URL, data=request_data, auth=self.oauth)
        self.log(json.dumps(req.json(), indent=2))
        self.processing_info = req.json().get('processing_info', None)
        self.check_status()

    def check_status(self):
        """Check the processing status."""
        if not self.processing_info:
            return

        state = self.processing_info['state']
        self.log(f'Media processing status is {state}')

        if state == 'succeeded':
            self.successful = True
            return

        if state == 'failed':
            self.log('Processing failed.')
            sys.exit(0)

        check_after_secs = self.processing_info['check_after_secs']
        self.log(f'Checking after {check_after_secs} seconds')
        time.sleep(check_after_secs)
        self.request_status()

    def request_status(self):
        """Request the current processing status."""
        self.log('STATUS')
        request_params = {'command': 'STATUS', 'media_id': self.media_id}
        req = requests.get(url=MEDIA_ENDPOINT_URL, params=request_params, auth=self.oauth)
        self.processing_info = req.json().get('processing_info', None)
        self.check_status()

    def generate_result(self):
        """Generate the final result JSON object."""
        final_state = f'SUCCESS {self.media_id}' if self.successful else 'ERROR'
        result = {
            'logs': self.logs,
            'final_state': final_state
        }
        print(json.dumps(result, indent=2))  # Output the result as JSON

if __name__ == '__main__':
    args = parse_args()
    oauth = OAuth1(
        args.consumer_key,
        client_secret=args.consumer_secret,
        resource_owner_key=args.access_token,
        resource_owner_secret=args.access_token_secret
    )
    video_tweet = VideoTweet(args.video_filename, oauth)
    video_tweet.upload_init()
    video_tweet.upload_append()
    video_tweet.upload_finalize()
    video_tweet.generate_result()
