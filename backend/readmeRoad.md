### Requerimientos

# se requiere instalar una version de node superior a la version v20.0.0

## instalacion
# instalamos los tipos de node
npm i --save-exact --save-dev  @types/node
# instalar el copilador de typescript, express
npm i --save-exact --save-dev typescript 
# instalar express y sus tipos
npm i --save-exact express
npm i --save-exact --save-dev @types/express 
# creamos el archivo de configuracion de typescript
tsc -init
# intalamos la libreria de mysql2(ya tiene incluido @types)
npm i --save-exact mysql2
# instalamos sequealize y sus tipos
npm i --save-exact sequelize
npm i --save-exact --save-dev @types/sequelize 

# cors
npm i --save-exact cors
npm i --save-exact --save-dev @types/cors

# 
npm i --save-exact winston helmet morgan winston-daily-rotate-file
npm i --save-dev --save-exact @types/helmet @types/winston @types/morgan

# argon2 no require tipos, ya tiene explicitamente sus tipos
npm i --save-exact argon2

# helmet no requiere instalar types
# jwk
npm i --save-exact jsonwebtoken
npm i --save-dev --save-exact @types/jsonwebtoken 

## instalar cookie parser
npm install --save-dev @types/cookie-parser --save-exact



