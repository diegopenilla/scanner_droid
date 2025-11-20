#!/usr/bin/env python3
import sys
import os
import json
import argparse
from dotenv import load_dotenv

# Load environment variables from .env in the Droid folder
# This assumes the .env file is in the same directory as this script (Droid/)
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Import from local standalone client
# We no longer append the parent directory to sys.path
try:
    from elevenlabs_client import ElevenLabsAPI
except ImportError:
    print(json.dumps({"error": "Could not import elevenlabs_client. Ensure it is in the Droid directory."}))
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Droid TTS Bridge')
    subparsers = parser.add_subparsers(dest='command', required=True)

    # Command: list
    subparsers.add_parser('list')

    # Command: generate
    gen_parser = subparsers.add_parser('generate')
    gen_parser.add_argument('text', type=str)
    gen_parser.add_argument('voice_id', type=str)
    gen_parser.add_argument('output_name', type=str)

    args = parser.parse_args()

    try:
        # Initialize API (reads ELEVEN_LABS_API_KEY from env which we loaded above)
        api_key = os.getenv("ELEVEN_LABS_API_KEY")
        if not api_key:
             raise ValueError("ELEVEN_LABS_API_KEY not found in environment or .env file")
             
        api = ElevenLabsAPI(api_key=api_key)
        
        if args.command == 'list':
            voices_data = api.list_voices()
            if voices_data and 'voices' in voices_data:
                # Return simplified list for the frontend
                simple_voices = [
                    {'name': v['name'], 'id': v['voice_id'], 'category': v.get('category', 'generated')} 
                    for v in voices_data['voices']
                ]
                print(json.dumps(simple_voices))
            else:
                print(json.dumps([]))

        elif args.command == 'generate':
            # Save to Droid/voices directory
            output_dir = os.path.join(os.path.dirname(__file__), 'voices')
            os.makedirs(output_dir, exist_ok=True)
            
            # Use create_voice_with_alignment matching wattson_elevenlabs.py behavior
            # This uses the /with-timestamps endpoint which we know works for this account
            result = api.create_voice_with_alignment(
                text=args.text,
                output_name=args.output_name,
                voice_id=args.voice_id,
                output_dir=output_dir,
                write_timing_file=False # We don't need the JSON timing file in Droid
            )
            
            if result and result.get('audio_file'):
                # create_voice_with_alignment returns the full path
                filename = os.path.basename(result['audio_file'])
                print(json.dumps({'success': True, 'file': filename}))
            else:
                print(json.dumps({'success': False, 'error': 'Failed to generate audio'}))

    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == "__main__":
    main()

