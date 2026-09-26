import os
import sys

print("Environment:", os.getenv("APP_ENV", "missing"))
print("Python:", sys.version.split()[0])
