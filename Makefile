tst_msg_1 = echo "It works!"
tst_msg_2 = Текстовое уведомление.

stupid-test:
	# $(tst_msg_2)
	$(tst_msg_1)



# Используйте эту задачу, чтобы развернуть у себя исходники проекта для дальнейшей работы.
dev: dload-src
	cd mmcs-form/; \
	git checkout dev; \
	npm update
	# Проект готов для Вашего кода!
	# Конфигурация базы данных лежит в config -> config.json



# Задача получения исходников для дальнейшего разворачивания production-сервера.
get-deploy: dload-src
	cd mmcs-form/; \
	npm update
	# Перед запуском сервера необходимо установить пароли для базы данных,
	# для этого перейдите в корневую папку проекта -> config -> config.json
	# и укажите нужные параметры для production конфигурации.

# Запуск production-сервера.
run-deploy:
	cd mmcs-form/; \
	NODE_ENV=production node bin/www



# Обновление production-сервера.
update:
	cd mmcs-form/; \
	git checkout master; \
	git pull; \
	npm update; \
	mkdir migrations; \
	node_modules/.bin/sequelize db:migrate
	# Проект и структура базы данных обновлены. Можно запускать сервер.



# Удаление всех файлов проекта.
clean:
	rm -rf mmcs-form/
	# Файлы проекта удалены.



dload-src:
	git clone https://github.com/a1tavista/mmcs-form.git