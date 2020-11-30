import psycopg2
import csv
import random
# Using PostgreSQL.
data = []
path = input('What file would you like to add? ')
with open('klasy/{}.csv'.format(path), newline='') as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        data.append(row)

connection = psycopg2.connect(user = 'server', password = 'paszport', host = 'localhost', port = '5432', database = 'wybory')
cursor = connection.cursor()

klasa = input('What\'s the ID for {}? '.format(data[0][1]))
for i in range(5,int(data[2][1])+5):
    token = hex(random.getrandbits(512))
    token = token[2:]
    if data[i][3].lower() == 'kobieta':
        plec = 2
    elif data[i][3].lower() == 'inne':
        plec = 3
    else:
        plec = 1
    if((data[i][2]).lower()=='brak'):
        postgreSQL_insert_Query = 'INSERT INTO students (token, email, sex, class, key) VALUES (\'{}\' ,\'{}\', {}, \'{}\', {});'.format(token ,data[i][1], plec, klasa, 'NULL')
        cursor.execute(postgreSQL_insert_Query)    
    else:
        postgreSQL_insert_Query = 'INSERT INTO students (token, email, sex, class, key) VALUES (\'{}\' ,\'{}\', {}, \'{}\', \'{}\');'.format(token ,data[i][1], plec, klasa, data[i][2])
        cursor.execute(postgreSQL_insert_Query)
        
    connection.commit()
