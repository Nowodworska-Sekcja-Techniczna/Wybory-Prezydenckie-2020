import time
from termcolor import colored
import psycopg2
import datetime
import pytz

utc=pytz.UTC

#------------ using PostgreSQL.
print('Trying to connect to PostgreSQL', end='', flush=True)
#time.sleep(1)
print('.', end='', flush=True)
#time.sleep(1)
print('.', end='', flush=True)
#time.sleep(1)
print('.', flush=True)
#time.sleep(1)

students_records = None
try:
    connection = psycopg2.connect(user = 'server', password = 'paszport', host = 'localhost', port = '5432', database = 'wybory')
    cursor = connection.cursor()
    postgreSQL_select_Query = "select * from students"
    cursor.execute(postgreSQL_select_Query)
    students_records = cursor.fetchall()
    print('Connection to PostgreSQL established!')
    # Adding emails to list

except(Exception, psycopg2.Error) as error:
    print('Error while establishing connection to PostgreSQL - ', error)
finally:
    # closing database connection.
    if(connection):
        cursor.close()
        connection.close()

class_records = None
try:
    connection = psycopg2.connect(user = 'server', password = 'paszport', host = 'localhost', port = '5432', database = 'wybory')
    cursor = connection.cursor()
    postgreSQL_select_Query = "select * from classes order by id asc"
    cursor.execute(postgreSQL_select_Query)
    class_records = cursor.fetchall()
    print('Connection to PostgreSQL established!')
    # Adding emails to list

except(Exception, psycopg2.Error) as error:
    print('Error while establishing connection to PostgreSQL - ', error)
finally:
    # closing database connection.
    if(connection):
        cursor.close()
        connection.close()

print('-------------------------------------COUNTED RESULTS------------------------------------')
print()
print('----------------------------------------------------------------------------------------')
print()
print('-------------------------------------CLASS BREAKDOWN------------------------------------')

#print(class_records)

allv = [0,0,0]
classres =  []
sexres = [[0,0,0], [0,0,0], [0,0,0]]
for i in range(0, 28):
    classres.append([0,0,0])

for st in students_records:
    if(st[6] == None):
        classres[st[3]][0] += 1
        sexres[st[2] - 1][0] += 1
        allv[0] += 1
    else:
        classres[st[3]][st[6]] += 1
        sexres[st[2] - 1][st[6]] += 1
        allv[st[6]] += 1
    


for i in range(0,28):
    print('---CLASS {}--- DID NOT VOTE: {} DID NOT SHARE: {} Anna Pocztowska: {} Filip Gawlik: {}'.format(
        class_records[i][1],
        classres[i][0],
        class_records[i][2] - (classres[i][0] + classres[i][1] + classres[i][2]),
        classres[i][1],
        classres[i][2]
    ))

print('----------------------------------------------------------------------------------------')
print()
print('---------------------------------------SEX BREAKDOWN------------------------------------')
print()

print('---MEN--- DID NOT VOTE: {} Anna Pocztowska: {} Filip Gawlik: {}'.format(
    sexres[0][0],
    sexres[0][1],
    sexres[0][2]
))
print('---WOMEN--- DID NOT VOTE: {} Anna Pocztowska: {} Filip Gawlik: {}'.format(
    sexres[1][0],
    sexres[1][1],
    sexres[1][2]
))
print('---OTHER--- DID NOT VOTE: {} Anna Pocztowska: {} Filip Gawlik: {}'.format(
    sexres[2][0],
    sexres[2][1],
    sexres[2][2]
))


print('----------------------------------------------------------------------------------------')
print()
print('--------------------------------------TIME BREAKDOWN------------------------------------')
print()

start = time.strptime('Thu Dec 5 08:00:00 2020')
times = []

for i in range(0, 48):
    times.append([time.mktime((start.tm_year, start.tm_mon, start.tm_mday, start.tm_hour, (start.tm_min + (30*i)), start.tm_sec, start.tm_wday, start.tm_yday, -1))])

#print(times)
for t in times:
    for st in students_records:
        t.append(0)
        t.append(0)
        t.append(0)
        
        if(st[5] == None):
            classres[st[3]][0] += 1
            t[1] += 1
        elif(utc.localize(datetime.datetime.utcfromtimestamp(t[0])) > st[5]):
            classres[st[3]][st[6]] += 1
            t[st[6] + 1] += 1
        else:
            t[1] += 1

    print('---{}--- DID NOT VOTE: {} Anna Pocztowska: {} Filip Gawlik: {}'.format(
        time.ctime(t[0]),
        t[1],
        t[2],
        t[3]
    ))


print('----------------------------------------------------------------------------------------')
print()
print('--------------------------------------FINAL RESULTS-------------------------------------')
print('     HAVE NOT VOTED: {}'.format(allv[0]))
print('     ANNA POCZTOWSKA: {}'.format(allv[1]))
print('     FILIP GAWLIK: {}'.format(allv[2]))

