import pigpio
import time

# Set up the GPIO pin and pigpio
PULSE_PIN = 17
pi = pigpio.pi()

if not pi.connected:
    print("Failed to connect to pigpio daemon.")
    exit()

# Minimum and maximum pulse width (in microseconds) to consider as valid
MIN_PULSE_WIDTH = 500  # 1 millisecond
MAX_PULSE_WIDTH = 100000  # 2 seconds

def measure_pulse_width(gpio, level, tick):
    global last_tick
    if level == 1:  # Rising edge detected
        last_tick = tick
    elif level == 0:  # Falling edge detected
        pulse_width = pigpio.tickDiff(last_tick, tick)
        
        # Ensure the pulse width is within a reasonable range
        if MIN_PULSE_WIDTH < pulse_width < MAX_PULSE_WIDTH:
            print(f"Pulse width: {pulse_width / 1_000_000:.6f} seconds")
        else:
            print(f"Noise detected with pulse width: {pulse_width / 1_000_000:.6f} seconds")

# Set up the callback for pulse width measurement
last_tick = 0
cb = pi.callback(PULSE_PIN, pigpio.EITHER_EDGE, measure_pulse_width)

try:
    while True:
        time.sleep(1)  # Keep the script running to continue measuring pulse widths

except KeyboardInterrupt:
    print("Measurement stopped by user")

finally:
    cb.cancel()
    pi.stop()