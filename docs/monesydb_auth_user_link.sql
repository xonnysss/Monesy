-- Ejecutar después de: python manage.py migrate

ALTER TABLE app_user
ADD CONSTRAINT fk_app_user_django_user
    FOREIGN KEY (django_user_id)
    REFERENCES auth_user(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;