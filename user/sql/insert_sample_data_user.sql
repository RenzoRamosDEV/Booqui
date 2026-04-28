-- Script para insertar datos de ejemplo en la tabla users

USE user;

INSERT INTO users (first_name, last_name, date_of_birth, contact_phone, contact_email, password, role) VALUES
('Mel', 'Admin', '2003-06-15', '631835827', 'mel@booqi.com', 'admin_mel', 'ADMIN'),
('Andrés', 'García', '1992-03-12', '611222333', 'andres.g@email.com', 'cust_pass_1', 'CUSTOMER'),
('Beatriz', 'López', '1995-07-23', '622333444', 'beatriz.l@email.com', 'cust_pass_2', 'CUSTOMER'),
('Carlos', 'Martínez', '2001-11-02', '633444555', 'carlos.m@email.com', 'cust_pass_3', 'CUSTOMER'),
('Diana', 'Sánchez', '1993-01-15', '644555666', 'diana.s@email.com', 'cust_pass_4', 'CUSTOMER'),
('Elena', 'Pérez', '1985-05-30', '655666777', 'elena.p@email.com', 'cust_pass_5', 'CUSTOMER'),
('Fernando', 'Gómez', '1997-04-10', '666777888', 'fernando.g@email.com', 'cust_pass_6', 'CUSTOMER'),
('Gloria', 'Ruiz', '1980-12-05', '677888999', 'gloria.r@email.com', 'cust_pass_7', 'CUSTOMER'),
('Hugo', 'Torres', '2001-08-21', '688999000', 'hugo.t@email.com', 'cust_pass_8', 'CUSTOMER'),
('Isabel', 'Vidal', '1987-02-18', '699000111', 'isabel.v@email.com', 'cust_pass_9', 'CUSTOMER'),
('Jorge', 'Cano', '1991-06-25', '600111222', 'jorge.c@email.com', 'cust_pass_10', 'CUSTOMER'),
('Karla', 'Blanco', '1994-10-14', '611223344', 'karla.b@email.com', 'cust_pass_11', 'CUSTOMER'),
('Luis', 'Méndez', '1989-09-08', '622334455', 'luis.m@email.com', 'cust_pass_12', 'CUSTOMER'),
('Marta', 'Rivas', '1996-12-12', '633445566', 'marta.r@email.com', 'cust_pass_13', 'CUSTOMER'),
('Noé', 'Vega', '2002-03-30', '644556677', 'noe.v@email.com', 'cust_pass_14', 'CUSTOMER');

INSERT INTO users (first_name, last_name, date_of_birth, contact_phone, contact_email, password, role) VALUES
('Renzo', 'Admin', '2004-09-18', '623971177', 'renzo@booqi.com', 'admin_renzo', 'ADMIN');