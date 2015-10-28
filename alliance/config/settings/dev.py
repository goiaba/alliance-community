#############################################################################################################
# This settings file is purposed for our centralized dev environment installed at alliance-dev.herokuapp.com
# If these configurations do not suit your environment, use a local.py settings file 
# Do not modify these configurations to suit any environment except the one at alliance-dev.herokuapp.com
#############################################################################################################

# Import base to override settings
from .base import *
import os

DEBUG = os.getenv('DEBUG', True)

this_file_dir = os.path.dirname(os.path.abspath(__file__))

if os.path.exists(os.path.join(this_file_dir, 'local.py')):
    print('Found a local.py file. OVERRIDING ALL THE THINGS!')
    from .local import *
    
#DATABASES = {
#    'default': {
#        'ENGINE': 'django.db.backends.sqlite3',
#        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#    }
#}

# This will parse database configuration from environment variable DATABASE_URL
# Conforms to heroku project setup requirements
import dj_database_url
DATABASES['default'] =  dj_database_url.config()
