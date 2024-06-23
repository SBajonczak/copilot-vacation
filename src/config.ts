const config = {
  botId: process.env.BOT_ID,
  botPassword: process.env.BOT_PASSWORD,
  azureOpenAIKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
  azureOpenAIDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,

  database:{
    user: process.env.DATABASE_USER, // better stored in an app setting such as process.env.DB_USER
    password: process.env.DATABASE_PASSWORD, // better stored in an app setting such as process.env.DB_PASSWORD
    server: process.env.DATABASE_SERVER, // better stored in an app setting such as process.env.DB_SERVER
    database: process.env.DATABASE_DATBASE, // better stored in an app setting such as process.env.DB_NAME
   }
 




};

export default config;
