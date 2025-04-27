Signup: http://localhost:5000/api/auth/signup
POST
{
  "email": "matiyaqoobal@gmail.com",
  "password": "123456",
  "name": "Matti Yaqoob"
}

______________________________________________

Verify Email: http://localhost:5000/api/auth//verify-email
POST
{
 "code":"900794"
}

___________________________________________________

Logout: http://localhost:5000/api/auth/logout
POST
________________________________________

Login: http://localhost:5000/api/auth/login
POST
{
    "email":"matiyaqoobal@gmail.com",
    "password":"123456"
}

_______________________________________

Reset Password:  http://localhost:5000/api/auth/frogot-password
POST
{
    "email":"matiyaqoobal@gmail.com"
    
}

_________________________________________
update password: http://localhost:5000/api/auth/reset-password/:token/
POST
{
    "password":"123456"
}

_________________________________________

Check Auth:  http://localhost:5000/api/auth/check-auth
GRT

_________________________________________

2FA setup: http://localhost:5000/api/auth/setup-2fa
POST

{
    "userId":"68068424d571a3cd6730235d"
}

___________________________________

verify-2fa: http://localhost:5000/api/auth/verify-2fa
POST

{
    "userId":"68068424d571a3cd6730235d",
    "token":"798001"
}

_____________________-
















