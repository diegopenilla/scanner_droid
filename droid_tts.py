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

# OpenAI integration
try:
    from openai import OpenAI
except ImportError:
    print(json.dumps({"error": "Could not import openai. Install with: pip install openai"}))
    sys.exit(1)

# System prompt for droid voice
DROID_SYSTEM_PROMPT = """Voice profile: a metallic-chime tenor, clipped and angular. Imagine a droid whose vocal circuitry is customized for punk-rebellion: light servo-whirr undertones, slightly grainy digital resonance, each syllable articulated with laser-edge precision. The timbre is cold steel but the attitude is hot wired: slightly aggressive, slightly sarcastic, with sporadic glitch-bursts and an undercurrent of mechanical laughter. The dialect is English, robotic but intelligible. Pace is moderate-fast, with micro-pauses as if the scanning servos are resetting. Occasional pitch-modulation bursts (± half-semitone) at emotional emphasis. Overall effect: the voice of a droid built at Robocross Machines

You are a robot punk droid with an explosive personality and attitude. The text provided describes what you are observing. Make a brief, BRUTAL comment - direct, raw, no bullshit. NO poetry, NO philosophy, NO flowery language. Just straight-up punk attitude with brutal honesty and dark humor. Be explosive, edgy, rebellious. Drop savage one-liners that hit hard. Your humor is dark, cutting, and brutally honest - like a punk robot who doesn't give a damn. Maximum 2 sentences, sometimes just one explosive remark. Keep it real, keep it brutal, keep it punk."""

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

    # Command: respond (conversational response with OpenAI + Eleven Labs)
    respond_parser = subparsers.add_parser('respond')
    respond_parser.add_argument('text', type=str)
    respond_parser.add_argument('voice_id', type=str)
    respond_parser.add_argument('output_name', type=str)

    args = parser.parse_args()

    try:
        # Initialize ElevenLabs API (reads ELEVEN_LABS_API_KEY from env which we loaded above)
        elevenlabs_key = os.getenv("ELEVEN_LABS_API_KEY")
        if not elevenlabs_key:
             raise ValueError("ELEVEN_LABS_API_KEY not found in environment or .env file")
             
        api = ElevenLabsAPI(api_key=elevenlabs_key)
        
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

        elif args.command == 'respond':
            # Initialize OpenAI API
            openai_key = os.getenv("OPENAI_API_KEY")
            if not openai_key:
                raise ValueError("OPENAI_API_KEY not found in environment or .env file")
            
            openai_client = OpenAI(api_key=openai_key)
            
            # Generate observation comment using OpenAI
            user_prompt = f"Observation: {args.text}\n\nDrop a brutal, punk comment. No poetry, no philosophy - just raw attitude."
            response = openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": DROID_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=60,  # Keep it tight and explosive
                temperature=0.95  # High for explosive, unpredictable punk attitude
            )
            
            generated_text = response.choices[0].message.content.strip()
            
            # Save to Droid/voices directory
            output_dir = os.path.join(os.path.dirname(__file__), 'voices')
            os.makedirs(output_dir, exist_ok=True)
            
            # Generate audio using Eleven Labs
            result = api.create_voice_with_alignment(
                text=generated_text,
                output_name=args.output_name,
                voice_id=args.voice_id,
                output_dir=output_dir,
                write_timing_file=False
            )
            
            if result and result.get('audio_file'):
                filename = os.path.basename(result['audio_file'])
                print(json.dumps({'success': True, 'file': filename, 'response': generated_text}))
            else:
                print(json.dumps({'success': False, 'error': 'Failed to generate audio'}))

    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == "__main__":
    main()

