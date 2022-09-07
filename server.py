import os
from waitress import serve

from beatbits.wsgi import application

# Get port from env variable.
port = 8000

# Serve django application with waitress.
if __name__ == '__main__':
    serve(application, port=port)