var config = {}
config.PORT = process.env.PORT
config.SSL = true
config.JWTSECRET = process.env.JWTSECRET

config.DBNAME = process.env.DBNAME
config.DBUSERNAME = process.env.DBUSERNAME
config.DBPASSWORD = process.env.DBPASSWORD
config.DBHOST = process.env.DBHOST
config.DBPORT = process.env.DBPORT
config.DBDIALECT = process.env.DBDIALECT
config.BUCKETNAME = process.env.BUCKETNAME
config.REGION = process.env.REGION
config.ACL = process.env.ACL
config.ACCESSKEY = process.env.ACCESSKEY
config.SECRETKEY = process.env.SECRETKEY
config.ROUTES_EXCLUDED_FROM_AUTH = [
    "/test", '', '/','/products/uploadFileToS3',
    '/login', '/register'
]


module.exports = config