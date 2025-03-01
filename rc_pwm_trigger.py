#!/usr/bin/env python3
"""
Servo Pulse Width Monitor

This script measures and monitors the pulse width from a servo signal using the pigpio library.
It can be used to debug servo signals or verify the correct operation of servo control systems.

The pulse width of a servo signal typically ranges from 1000µs to 2000µs, with:
- 1000µs (1ms) corresponding to -90 degrees
- 1500µs (1.5ms) corresponding to 0 degrees (center position)
- 2000µs (2ms) corresponding to +90 degrees

Requirements:
- Raspberry Pi with pigpio daemon running (sudo pigpiod)
- Connect the servo signal wire to GPIO pin 17 (BCM numbering)
- Connect ground to a Raspberry Pi ground pin

Usage:
  python3 servo_monitor.py

Press Ctrl+C to exit the program.
"""

import pigpio
import time
import argparse
import signal
import sys

class PulseWidthReader:
    """
    A class to read and measure pulse widths on a GPIO pin.
    
    This class uses pigpio callbacks to detect rising and falling edges
    on the specified GPIO pin and calculate the pulse width.
    
    Attributes:
        _gpio (int): The GPIO pin number to monitor
        _pulse_width (int): The last measured pulse width in microseconds
        _last_tick (int): The timestamp of the last edge detection
        _cb: The pigpio callback object
    """
    
    def __init__(self, pi, gpio):
        """
        Initialize the PulseWidthReader.
        
        Args:
            pi: A pigpio.pi() instance
            gpio (int): The GPIO pin to monitor
        """
        self._pi = pi
        self._gpio = gpio
        self._pulse_width = 0
        self._last_tick = None
        self._last_edge_time = time.time()
        self._signal_detected = False
        
        # Register callback for both rising and falling edges
        self._cb = pi.callback(self._gpio, pigpio.EITHER_EDGE, self._callback)

    def _callback(self, gpio, level, tick):
        """
        Callback function triggered on GPIO edge transitions.
        
        Args:
            gpio (int): The GPIO that triggered the callback
            level (int): The level of the GPIO (0 for falling, 1 for rising)
            tick (int): The time stamp in microseconds
        """
        if level == 1:  # Rising edge
            self._last_tick = tick
            self._last_edge_time = time.time()
            self._signal_detected = True
        elif level == 0 and self._last_tick is not None:  # Falling edge
            self._pulse_width = pigpio.tickDiff(self._last_tick, tick)

    def get_pulse_width(self):
        """
        Get the last measured pulse width.
        
        Returns:
            int: The pulse width in microseconds
        """
        return self._pulse_width
    
    def is_signal_present(self):
        """
        Check if a signal is being detected.
        
        Returns:
            bool: True if a signal has been detected in the last second
        """
        return self._signal_detected and (time.time() - self._last_edge_time) < 1.0
    
    def cleanup(self):
        """Clean up resources used by the reader."""
        if hasattr(self, '_cb') and self._cb is not None:
            self._cb.cancel()

def map_pulse_to_angle(pulse_width):
    """
    Convert a pulse width to an approximate servo angle.
    
    Args:
        pulse_width (int): Pulse width in microseconds
        
    Returns:
        float: Approximate angle in degrees (-90 to +90)
    """
    # Standard servo range is typically 1000-2000µs mapping to -90 to +90 degrees
    if pulse_width < 500:  # Likely no signal or error
        return None
        
    # Clamp to standard range
    pulse_width = max(1000, min(pulse_width, 2000))
    
    # Map 1000-2000µs to -90 to +90 degrees
    return ((pulse_width - 1500) / 500) * 90

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully."""
    print("\nExiting program")
    sys.exit(0)

def main():
    """Main function to run the servo pulse width monitor."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Monitor servo pulse width signals')
    parser.add_argument('--pin', type=int, default=17, 
                        help='GPIO pin number (BCM numbering) connected to servo signal')
    parser.add_argument('--interval', type=float, default=0.1,
                        help='Sampling interval in seconds')
    args = parser.parse_args()
    
    # Register signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    # Initialize pigpio
    pi = pigpio.pi()
    if not pi.connected:
        print("Failed to connect to pigpio daemon!")
        print("Try running 'sudo pigpiod' first")
        sys.exit(1)
    
    try:
        # Initialize the pulse width reader
        reader = PulseWidthReader(pi, args.pin)
        
        print(f"Monitoring servo signal on GPIO {args.pin}")
        print("Press Ctrl+C to exit")
        print("\n{:<12} {:<12} {:<15}".format("Pulse (µs)", "Angle (°)", "Status"))
        print("-" * 40)
        
        # Main loop
        while True:
            pulse_width = reader.get_pulse_width()
            angle = map_pulse_to_angle(pulse_width)
            
            if reader.is_signal_present():
                if angle is not None:
                    status = "Active"
                    print(f"\r{pulse_width:<12} {angle:+.1f}°{' ':<10} {status:<15}", end="")
                else:
                    status = "Invalid pulse"
                    print(f"\r{pulse_width:<12} {'N/A':<12} {status:<15}", end="")
            else:
                status = "No signal"
                print(f"\r{'N/A':<12} {'N/A':<12} {status:<15}", end="")
            
            sys.stdout.flush()
            time.sleep(args.interval)
            
    except Exception as e:
        print(f"\nError: {e}")
        
    finally:
        # Clean up
        if 'reader' in locals():
            reader.cleanup()
        pi.stop()

if __name__ == "__main__":
    main()