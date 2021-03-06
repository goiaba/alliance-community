
Installation
============

###1) Install python (2.7 or higher) and development packages

	sudo apt-get install python2.7

	sudo apt-get install python-dev

###2) Install PostgreSQL and related packages

Currently 9.4 is the most current release of postgres:

	sudo apt-get install postgresql-9.4
	
	sudo apt-get install libpq-dev
	
helpful link: https://help.ubuntu.com/community/PostgreSQL

###3) Get the project code

From the directory where you want your project to reside. We will call this the "project directory."

	git clone https://github.com/NorthBridge/alliance-community.git

###4) Install project dependencies.

Use a virtual environment (Ubuntu):

Install pip

	sudo apt-get install python-pip

Install virtualenv using pip

	pip install virtualenvwrapper

Add the following two lines to your ~/.bashrc script:

    export WORKON_HOME=$HOME/.virtualenvs
    source /usr/local/bin/virtualenvwrapper.sh

Close the file and source it:

	source ~/.bashrc

Go to the project directory: Make sure you are in the directory alliance-community (if you do "ls" in your command line you will find there is another folder called alliance. Don't go in there. Stay here.)

	mkvirtualenv alliance

The next command is only necessary if you are not already using the created virtualenv

	workon alliance

*to get out of the virtual environment type in:
	
	deactivate

Install python dependencies (while in virtual environment aka (alliance)):

	pip install -r requirements.txt

*Running this installs the packages listed in requirements.txt to your virtual environment (only in alliance):
	
###5) Update your database connection settings using your database admin user

The database settings are stored in environment variables and must be added to represent your local environment. You can name your database whatever you like. In this guide, we assume that the name is northbr6_devwaterwheel

There are several ways to go about setting environment variables. One way to set system-wide variables is to edit the file /etc/environment, adding the following

	# Alliance database configuration
	ALLIANCE_DB_NAME=northbr6_devwaterwheel
	ALLIANCE_DB_USER=postgres
	ALLIANCE_DB_PASSWORD=postgres
	ALLIANCE_DB_HOST=127.0.0.1
	ALLIANCE_DB_PORT=5432
        
This is assuming that you are using user postgres with password postgres with port 5432 and database northbr6_devwaterwheel. However you can use whatever you like so long as things match. In this tutorial we will be using the above stated assumptions.

Create the database north6_devwaterwheel by running the following SQL command (you can use psql or any client of your choice). First you must sign into the postgres user (if prompt for a password when getting into the postgres superuser type in your computer password:

	sudo su - postgres
	psql
	create database northbr6_devwaterwheel;

After you are done with setting up the database you can log out by Ctrl+D twice OR until you see that you are back in your virtual environment, you see (alliance). You should always see (alliance) unless in postgres. 

*In case you need to change your password for user posgres:

	sudo -u postgres psql postgres

Now that you are connected to psql you can change your password to 'postgres':

	\password postgres


###6) Configure Django

Run Django migration scripts (only AFTER database is setup/configured):

	cd <project-directory>/alliance

	python manage.py makemigrations
	python manage.py migrate

Create a superuser (you will be prompted to type in a username, email and password):

	python manage.py createsuperuser

Use the bin/seed/static_inserts.sql file to populate the database with useful testing information:

Open the file (bin/seed/static_inserts.sql) and update the lines below with your information:

	\set email '\'' '\<The email you used to create the django superuser account>' '\''
	\set fname '\'' '\<your first name>' '\''
	\set lname '\'' '\<your last name>' '\''
	\set github_repo '\'' '<github test repo>' '\''
	
For example:

	\set email '\'' 'johndoe@gmail.com' '\''
	\set fname '\'' 'John' '\''
	\set lname '\'' 'Doe' '\''
	\set github_repo '\'' 'https://github.com/myorg/githubtest' '\''

After that, run the following command to import the data (you must be logged as a user that has privileges to access/update the database or provide user/password information to psql):

	sudo su - postgres
    psql northbr6_devwaterwheel < <project directory>/bin/seed/static_inserts.sql

	
We also must create a trigger that will be responsible for update the backlog.update_dttm field. This trigger will be fired on a row update event. The Postgres_Update_Trigger.sql script is located under the db folder.

	psql northbr6_devwaterwheel_test < <project directory>/bin/seed/postgres_update_trigger.sql

The system can notify users through email when an error on modules import/export occurs. Configuration for this optional feature should be done using environment variables.

One way to do this is to edit the system file /etc/environment, by adding something like the following:

	# Alliance email configuration
	SMTP_SERVER = 'smtp.gmail.com'
	SMTP_USER = 'exampleName@gmail.com'
	SMTP_PASSWORD = 'myPassword'
	SMTP_PORT = 587
	SMTP_RECIPIENT_LIST = ['exampleName2@gmail.com']
	
The main functionality of the system is the integration with the GitHub API. In order to put this integration to work there are some pre-requirements that must be met:

- You must have a GitHub Organization
- The GitHub repositories must be inside this organization. Of course, a repository must exist before the system can interact with it.
- You must create a "Personal access token":
- Click on your GitHub profile picture and select "Settings"
- Chose "Personal access tokens" on the left menu
- Chose a description for the token
- Select the scopes: repo, public_repo, user, gist
- Click "Generate token"
- Copy the generated token as we will use it later (warning: You cannot access the generated token after leaving the page so be careful to store it elsewhere)

- You must configure a GitHub webhook inside the Organization:

*Helpful link: https://developer.github.com/webhooks/creating/

To set up a repository webhook on GitHub, head over to the Settings page of your repository, and click on Webhooks & services. After that, click on Add webhook.

Payload URL = the server endpoint that will receive the webhook payload.

The Payload URL must point to: 
-If you are running over HTTP (for example, through manage.py script):
  	
  	http://\<host\>:\<port\>/alliance/apps/backlog/githubimport

install ngrok: https://ngrok.com/download
-first download and then unzip
-you can extract it in your downloads folder and then run it:

	~/Downloads/ngrok http 8000


Something like this will pop up:
	
	ngrok by @inconshreveable                                       (Ctrl+C to quit)
	                                                                                
	Tunnel Status                 online                                            
	Version                       2.0.19/2.0.19                                     
	Web Interface                 http://127.0.0.1:4040                             
	Forwarding                    http://389c1340.ngrok.io -> localhost:8000        
	Forwarding                    https://389c1340.ngrok.io -> localhost:8000       
	                                                                                
	Connections                   ttl     opn     rt1     rt5     p50     p90       
	                              0       0       0.00    0.00    0.00    0.00  
	
	http://389c1340.ngrok.io/alliance/apps/backlog/githubimport
	
^This become the payload url. note that http://389c1340.ngrok.io/ points to localhost:8000 (the default)

- If you want to use HTTPS (the HTTP server must be configured):
    - https://\<host\>:\<port\>/alliance/apps/backlog/githubimport
    - Remember to "Disable SSL verification" if you have a self signed certificate
- Content type: application/json
- Secret: chose a strong secret
- Which events would you like to trigger this webhook?
  - Choose "Let me select individual events" and check the "Issues" event.

Configuration for this optional feature should be done using environment variables.

One way to do this is to edit the system file /etc/environment, by adding something like the following:

	ALLIANCE_GITHUB_OWNER = "\<GitHub Organization\>"
	ALLIANCE_GITHUB_TOKEN = "\<GitHub generated token\>"
	ALLIANCE_GITHUB_WEBHOOK_SECRET = "\<The secret you created on GitHub\>"

Running
=======

	python manage.py runserver [host:port]


example (add the same info you added when creating the webhook aka the same host and port):
	
	python manage.py runserver 


Now you can go to \<host\>:\<port\>/admin and login using the user created above. 

example--type this into the web url: 

	localhost:8000/admin


You can create groups and regular users that will be used to login into the alliance application (\<host\>:\<port\>/alliance).

example--type this into the web url: 

	localhost:8000/alliance/apps/backlog


###Let's Get Started!

After logging into the admin interface, create a new user, using the same email you specified when running the static_inserts.sql file. The email field will be the link between the django auth user and the NorthBridge volunteer. Add the "Volunteers" group to the "Chosen groups" field of the user.

Creating User:

go to localhost:8000/admin (still have the runserver running on the terminal).
Under the Authentication and Authorization administration tab click on "Users". Add a new user example: newuser and give a password (i.e. password); type it 2x and click save!

Congrats! you just created your first user! (well other than the user you created while in the terminal--that createsuperuser command) So what can this user do?!

You should have been directed to a new page where you can fill out neat stuff about your user. Do whatever you like!

Example:
	
	Personal Info:
	first name: new
	last name: user
	email: newuser@newuser.gq
	
	Permissions: Active
	Groups: Volunteer (add-- click the arrow)
	User Permissions: admin | log entry | can change log entry (add-- click the arrow)
	Date joined: today & now
	click SAVE!

####Remember creating your superuser in the terminal?
while still in the admin page under "Core" click on Volunteers. Recognize someone? there you are!

Now you are ready to logout from admin account and access the application using the regular user you have created above.

####To the Alliance!

Go to localhost:8000/alliance/apps/backlog

A main restriction is that the user's email must match the volunteer's email. It is through this relation that we can link a django user and the volunteer's informations. For now there is no database constraint ensuring this.
