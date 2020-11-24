import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import time
from termcolor import colored

sender_email = 'nowodworek.krk@gmail.com'
user = 'nowodworek.krk@gmail.com'
receivers_email = ['nowodworek.krk@gmail.com']
password =  'x74rC5jtuCAJUb7'

message = MIMEMultipart('alternative')
message['Subject'] = 'Nowodworskie Wybory Prezydenckie 2020/21'
message['From'] = 'NWD Tech & NKWD'

text = '''
Witaj obywatelu!
Wybory się odbędą.
'''

message.attach(MIMEText(text, 'plain', 'UTF-8'))
try:
    session = smtplib.SMTP_SSL('smtp.gmail.com',465)
    session.login(user, password)
    for rec in receivers_email:
        session.sendmail(sender_email, rec, message.as_string())
        print('[{}]'.format(colored(time.asctime(), 'green')),"Email to {} sent!".format(rec))
    session.quit()
    

except Exception as exc:
    print('[{}]'.format(colored(time.asctime(), 'red')),'Error sending mail')
    print(exc)
