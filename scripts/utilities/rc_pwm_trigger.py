import pigpio
import time

# Pin number where the servo signal is connected
SERVO_PIN = 17

# Initialize pigpio
pi = pigpio.pi()

if not pi.connected:
    print("Failed to connect to pigpio daemon!")
    exit()

# Callback function to handle the pulse
class PulseWidthReader:
    def __init__(self, gpio):
        self._gpio = gpio
        self._last_tick = None
        self._pulse_width = 0
        self._cb = pi.callback(self._gpio, pigpio.EITHER_EDGE, self._callback)

    def _callback(self, gpio, level, tick):
        if self._last_tick is not None:
            if level == 0:  # Falling edge
                self._pulse_width = pigpio.tickDiff(self._last_tick, tick)
        self._last_tick = tick

    def get_pulse_width(self):
        return self._pulse_width

try:
    reader = PulseWidthReader(SERVO_PIN)

    while True:
        pulse_width = reader.get_pulse_width()
        print(f"Pulse width: {pulse_width} µs")
        time.sleep(0.1)

except KeyboardInterrupt:
    print("Exiting program")

finally:
    pi.stop()