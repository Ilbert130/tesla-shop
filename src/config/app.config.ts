

export const EnvConfiguration = () => ({
    db_user:process.env.DB_USER,
    db_password:process.env.DB_PASSWORD,
    db_name:process.env.DB_NAME,
    db_host:process.env.DB_HOST,
    db_port:process.env.DB_PORT,
    port:process.env.PORT,
    host_api:process.env.HOST_API,
});