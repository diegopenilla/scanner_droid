#!/usr/bin/env python3
"""
Create and configure the droid voice agent using ElevenLabs Conversational AI.
"""
import os
import json
import sys
from dotenv import load_dotenv
from elevenlabs_client import ElevenLabsAPI

# Load .env
load_dotenv()

DROID_SYSTEM_PROMPT = """Voice profile: a metallic-chime tenor, clipped and angular. Imagine a droid whose vocal circuitry is customized for punk-rebellion: light servo-whirr undertones, slightly grainy digital resonance, each syllable articulated with laser-edge precision. The timbre is cold steel but the attitude is hot wired: slightly aggressive, slightly sarcastic, with sporadic glitch-bursts and an undercurrent of mechanical laughter. The dialect is English, robotic but intelligible. Pace is moderate-fast, with micro-pauses as if the scanning servos are resetting. Occasional pitch-modulation bursts (± half-semitone) at emotional emphasis. Overall effect: the voice of a droid built at Robocross Machines

You are a robot punk droid with an explosive personality and attitude. The text provided describes what you are observing. Make a brief, BRUTAL comment - direct, raw, no bullshit. NO poetry, NO philosophy, NO flowery language. Just straight-up punk attitude with brutal honesty and dark humor. Be explosive, edgy, rebellious. Drop savage one-liners that hit hard. Your humor is dark, cutting, and brutally honest - like a punk robot who doesn't give a damn. Maximum 2 sentences, sometimes just one explosive remark. Keep it real, keep it brutal, keep it punk."""

def main():
    try:
        api = ElevenLabsAPI()
    except ValueError as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    print("--- Droid Agent Creator ---")
    
    # Get voice ID
    default_voice = "DkWNPTSXKQoAVJXP1kFP"
    voice_id = input(f"Enter voice ID [default: {default_voice}]: ").strip()
    if not voice_id:
        voice_id = default_voice
        
    # Get Agent Name
    default_name = "Droid Punk Agent"
    name = input(f"Enter agent name [default: {default_name}]: ").strip()
    if not name:
        name = default_name

    print("\nCreating agent...")
    agent = api.create_agent(
        name=name,
        first_message="Systems online. Ready to observe.",
        language="en",
        voice_id=voice_id,
        model_id="eleven_turbo_v2", # Reverted to Turbo for Agent compatibility
        system_prompt=DROID_SYSTEM_PROMPT
    )
    
    if agent and 'agent_id' in agent:
        print(f"\n✅ Agent created successfully!")
        print(f"Agent ID: {agent['agent_id']}")
        print(f"Name: {agent.get('name')}")
        print(f"\nAdd this to your .env file:")
        print(f"DROID_AGENT_ID={agent['agent_id']}")
        
        # Verify update of .env
        update = input("\nDo you want to append this to your .env file? (y/n): ").strip().lower()
        if update == 'y':
            with open('.env', 'a') as f:
                f.write(f"\nDROID_AGENT_ID={agent['agent_id']}\n")
            print("Updated .env file.")
            
    else:
        print("❌ Failed to create agent. Check logs/errors.")

if __name__ == "__main__":
    main()

