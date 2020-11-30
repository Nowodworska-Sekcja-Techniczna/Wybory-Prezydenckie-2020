import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import time
from termcolor import colored
import psycopg2

receivers_data = []

#------------ using PostgreSQL.
print('Trying to connect to PostgreSQL', end='', flush=True)
time.sleep(1)
print('.', end='', flush=True)
time.sleep(1)
print('.', end='', flush=True)
time.sleep(1)
print('.', flush=True)
time.sleep(1)
try:
    connection = psycopg2.connect(user = 'server', password = 'paszport', host = 'localhost', port = '5432', database = 'wybory')
    cursor = connection.cursor()
    postgreSQL_select_Query = "select * from students"
    cursor.execute(postgreSQL_select_Query)
    students_records = cursor.fetchall()
    print('Connection to PostgreSQL established!')
    # Adding emails to list
    for row in students_records:
        receivers_data.append((row[0], row[1], row[4], row[6]))

except(Exception, psycopg2.Error) as error:
    print('Error while establishing connection to PostgreSQL - ', error)
finally:
    # closing database connection.
    if(connection):
        cursor.close()
        connection.close()

#---------- sending emails.
print(receivers_data)
sender_email = 'nowodworek.krk@gmail.com'
user = 'nowodworek.krk@gmail.com'
password =  'x74rC5jtuCAJUb7'

for tup in receivers_data:
    if(tup[3] != None):
        continue
    #if(tup[1] != 'szwandaw@gmail.com'):
    #    continue

    message = MIMEMultipart('alternative')
    message['Subject'] = 'Nowodworskie Wybory Prezydenckie 2020/21'
    message['From'] = 'NWD Tech & NKWD'
    message['To'] = tup[1]
    message['List-Unsubscribe'] = 'mailto: wybory@nowodworek.rocks?subject=unsubscribe'

    text = '''
    Witaj Obywatelu Nowodworski!
    Z racji na panujący stan epidemii Wybory Prezydenckie odbywają się w tym roku zdalnie, organizowane przez Sekcje techniczną oraz NKWD.

    Poniżej znajduje się link pod którym możesz oddać głos:
    https://nowodworek.rocks/glos?token={}

    Życzymy powodzenia kanydatom i miłych wyborów.

    SEMPER IN ALTUM
    (Ten mail jest przeznaczony dla beta-testerów, TO NIE SĄ WYBORY)
    '''.format(tup[0])
    #print(text)
    message.attach(MIMEText(text, 'plain', 'UTF-8'))
    try:
        session = smtplib.SMTP_SSL('smtp.gmail.com',465)
        session.login(user, password)
        session.sendmail(sender_email, tup[1], message.as_string())
        print('[{}]'.format(colored(time.asctime(), 'green')),"Email to {} sent!".format(tup[1]))
        session.quit()
    

    except Exception as exc:
        print('[{}]'.format(colored(time.asctime(), 'red')),'Error sending mail -', exc)
