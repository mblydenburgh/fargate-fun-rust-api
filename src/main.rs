use actix_web::{get, HttpServer, App, HttpResponse, Responder};

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().body("Healthy")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(health)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

