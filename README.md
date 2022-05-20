# readme for deliverable 3
For both clinician and patient password:
        The length of password between 8 and 16.
        The characters for password include: regular expression-->  /^[A-Za-z0-9_@./#&+-]*$/ 
 All account data register input would have reasonable data input validation functions to prevent undesirable data entry.
For clinician:
        Clinicians can update their accounts password.
        Clinicians can update the workplace.
        Clinicians can set up an account for patient (the password is without bcrypt for patient to know their password)

 Clinicians could adjust the tasks for patients to record each day. 
 Clinicians could examine the data and comments recorded by patients each days. 
 Clinicians could write quicknotes for each patients. 
        Clinician would have a brief view on patients' fresh record and comments today on clinician dashboard, with comment-searching functions (this is not required by the business requirement so it is just a static input box without real function).

        The Clinician marks the patient's tasks (The tasks they need to record their data). This mark will appear on patient dashboard next day after doctor marked. 


For patient:
	Patient can update the password.
	Patient can see their rank and top5 in motivation (Accomplishment) page.
	Patients could update their daily records once per day with their own comments. 
	Patients could collect leaves for records they record and leaves would display on dashboard and accomplishment pages. More leaves would make the progress tree on accomplishment page grow.
        Our default safety range for demo purpose is listed as follow:
                bloogSugar:  3 ~ 7
                weight:  50 ~ 60
                insulin:  0 ~ 2
                exercise:  100 ~ 1000
        Patient can submit record data depends on the real context and clinician's preset range.
        

For motivation:
        The tree in motivation page grow as data is entered, the changes would update every 20 days.


Patient1 (Pat Smith) and patient5 (tori rich) both contain at least 10 records.


Account for clinician and patient:
    clinician1: 
        account: chris@gmail.com
        password: 12345678
        Name: Chris Cao
        Include patient: patient1 (Pat Smith), patient3 (Aman EM),
                         patient5 (tori rich), patient4 (Leonardo DiCaprio),
                         patient6 (Nicole Kidman), patient10 (Isabella)

    clinician2: 
        account: makoto@gmail.com
        password: qwert123
        Name: Makoto Zhang
        Include patient: patient2 (Apple Xin), patient7 (Charlotto),
                         patient9 (Olivia Liam), patient8 (Sophia Armstor)

    patient1: 
            account:  pat@gmail.com
            password: pat12345
    patient2:
            account:  apple@gmail.com
            password:  1234apple
    patient3:
            account:  aman@gmail.com
            password:  12345678
    patient4:
            account:  leon@gmail.com 
            password:  87654321

    patient5:
            account:  h1@gmail.com 
            password:  h1234567
    patient6:
            account:  nicole@gmail.com
            password:  12345678
    patient7:
            account:  Charlotte@gmail.com
            password:  12345678
    patient8:
            account:  Sophia@gmail.com
            password:  12345678
    patient9:
            account: Olivia@gmail.com
            password:  12345678
    patient10:
            account: Isabella@gmail.com
            password:  12345678
