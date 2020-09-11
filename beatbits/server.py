from waitress import serve

from yourdjangoproject.wsgi import application

# Serve django application with waitress.

if __name__ == '__main__':
    serve(application, port='8000')