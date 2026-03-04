-- ParqueAndoDB (MySQL) - Modelo Airbnb

CREATE TABLE usuario (
  id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  foto_perfil_url VARCHAR(500),
  rol_principal VARCHAR(20) NOT NULL DEFAULT 'CONDUCTOR',
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  es_activo TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_usuario_correo (correo)
) ENGINE=InnoDB;

CREATE TABLE vehiculo (
  id_vehiculo BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT NOT NULL,
  placa VARCHAR(20) NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  color VARCHAR(30),
  es_activo TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_vehiculo_placa (placa),
  CONSTRAINT fk_vehiculo_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE parqueadero (
  id_parqueadero BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_propietario BIGINT NOT NULL,
  titulo VARCHAR(120) NOT NULL,
  direccion VARCHAR(250) NOT NULL,
  referencia VARCHAR(250),
  latitud DECIMAL(10,8) NOT NULL,
  longitud DECIMAL(11,8) NOT NULL,
  tarifa_hora DECIMAL(10,2) NOT NULL,
  tarifa_dia DECIMAL(10,2),
  tiene_camara TINYINT(1) NOT NULL DEFAULT 0,
  tiene_techo TINYINT(1) NOT NULL DEFAULT 0,
  tiene_guardia TINYINT(1) NOT NULL DEFAULT 0,
  calificacion_promedio DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  es_activo TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_parqueadero_propietario FOREIGN KEY (id_propietario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE parqueadero_imagen (
  id_imagen BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_parqueadero BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  es_principal TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_imagen_parqueadero FOREIGN KEY (id_parqueadero)
    REFERENCES parqueadero(id_parqueadero) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reserva (
  id_reserva BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_parqueadero BIGINT NOT NULL,
  id_vehiculo BIGINT NOT NULL,
  id_conductor BIGINT NOT NULL,
  fecha_hora_inicio DATETIME NOT NULL,
  fecha_hora_fin DATETIME NOT NULL,
  total_estimado DECIMAL(10,2) NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  codigo_reserva VARCHAR(15) NOT NULL,
  url_comprobante VARCHAR(500),
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reserva_parqueadero FOREIGN KEY (id_parqueadero) REFERENCES parqueadero(id_parqueadero),
  CONSTRAINT fk_reserva_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo),
  CONSTRAINT fk_reserva_conductor FOREIGN KEY (id_conductor) REFERENCES usuario(id_usuario),
  UNIQUE KEY uq_reserva_codigo (codigo_reserva)
) ENGINE=InnoDB;

CREATE TABLE pago (
  id_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_reserva BIGINT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50),
  estado_pago VARCHAR(20) NOT NULL DEFAULT 'COMPLETADO',
  transaccion_id VARCHAR(100),
  fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva),
  UNIQUE KEY uq_pago_reserva (id_reserva)
) ENGINE=InnoDB;

CREATE INDEX idx_parqueadero_geo ON parqueadero (latitud, longitud);
CREATE INDEX idx_reserva_parqueadero_fechas ON reserva (id_parqueadero, fecha_hora_inicio, fecha_hora_fin);
