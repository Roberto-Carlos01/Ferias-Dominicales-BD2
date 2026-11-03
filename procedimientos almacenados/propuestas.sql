#trigger nro 2 
#Valida como regla de negocio estricta que nadie puede registrar o actualizar un stock de productos con valor menor a 0.
DELIMITER //

    # que no creen un stock menor a 0
CREATE TRIGGER trg_valida_stock_insert
BEFORE INSERT ON OFRECE
FOR EACH ROW
BEGIN
    IF NEW.stock < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error El stock de un producto no puede ser menor a 0.';
    END IF;
END;
//

    # si quieren actualizar igual
CREATE TRIGGER trg_valida_stock_update
BEFORE UPDATE ON OFRECE
FOR EACH ROW
BEGIN
    IF NEW.stock < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error No se puede actualizar con valor menor a 0.';
    END IF;
END;
//

DELIMITER ;

#trigger nro 3
#Realiza de forma transaccional la asignación de un expositor a un STAND,
# inserta en CONFORMAN y crea el registro en Exposición y actualiza el STAND a ocupado.
DELIMITER //

CREATE TRIGGER trg_asociar_expositor_stand
AFTER INSERT ON CONFORMAN
FOR EACH ROW
BEGIN
    # act estado del STAND
    UPDATE STAND 
    SET estado = 'OCUPADO' 
    WHERE nroStand = NEW.nroStand 
      AND idFeria = NEW.idFeria;

    #Crear un registro
    INSERT INTO EXPOSICION (tituloExposicion, descripcion, idFeria, nroStand)
    VALUES (
        CONCAT('Exposición de Expositor CI: ', NEW.ciExpositor),
        CONCAT('Exposición oficial en el cargo: ', IFNULL(NEW.cargo, 'Participante')),
        NEW.idFeria,
        NEW.nroStand
    );
END;
//

DELIMITER ;