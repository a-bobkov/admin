angular.module('app.dal.entities.user', ['app.dal.entities.collection', 'app.dal.rest.api', 
    'app.dal.entities.city',
    'app.dal.entities.dealer',
    'app.dal.entities.group',
    'app.dal.entities.status',
    'app.dal.entities.manager',
    'app.dal.entities.market',
    'app.dal.entities.metro',
    'app.dal.entities.site'
])

/*
Сервис userLoader
Такой сервис должен быть реализован для каждого справочника, получаемого от дата-провайдера (комплексным или персональным запросом)
Выполняет загрузку, проверку и конвертацию данных справочника.
Требования к загрузчику справочника:
- должен брать данные от дата-провайдера, независимо от текущего состояния данных
- должен возвращать данные коллекции, вызывая ее конструктор
- должен выполнять проверку ссылочной целостности
- должен разрешать ссылки
- должен иметь явные зависимости от тех справочников, на которые он ссылается
*/

.factory('usersLoader', function(userApi, users, cities, groups, managers, markets, metros, sites, statuses,
	citiesLoader, groupsLoader, managersLoader, marketsLoader, metrosLoader, sitesLoader, statusesLoader) {

	/*
	Метод проверки и обработки данных справочника, полученных от дата-провайдера
	Входы:
		Массив данных, полученных от дата-провайдера
	Выходы:
		Коллекция со ссылками, разрешенными по коллекциям, имеющимся на момент проверки
	Необходимые зависимости:
		Коллекции (для проверки ссылочной целостности)
	*/
	this.addItems = function(itemsData, queryParams) {
	    if (!_.isArray(itemsData)) {
	        throw new CollectionError('Отсутствует массив в данных: ' + angular.toJson(itemsData));
	    }
	    var newItemsData = _.invoke(itemsData, function(itemData) {
	        if (typeof itemData.id === 'undefined') {
	            throw new CollectionError('Нет параметра id в элементе: ' + angular.toJson(itemData));
	        }
	        return _.mapValues(itemData, function(value, key) {
	        	var newValue = value;
	        	if (_.isObject(value) && Object.keys(value).length === 1 && typeof value.id !== 'undefined') {    // ссылка
	        		if (key === 'city') {
		            	newValue = _find(cities.getItems(), {id: value.id});
	        		} else if (key === 'group') {
		            	newValue = _find(groups.getItems(), {id: value.id});
	        		} else if (key === 'manager') {
		            	newValue = _find(managers.getItems(), {id: value.id});
	        		} else if (key === 'market') {
		            	newValue = _find(markets.getItems(), {id: value.id});
	        		} else if (key === 'metro') {
		            	newValue = _find(metros.getItems(), {id: value.id});
	        		} else if (key === 'site') {
		            	newValue = _find(sites.getItems(), {id: value.id});
	        		} else if (key === 'status') {
		            	newValue = _find(statuses.getItems(), {id: value.id});
	        		} else {
		                throw new CollectionError('Не найдена коллекция по ссылке ' + key + ': ' +angular.toJson(value));
	        		}
	        		if (!newValue) {
		                throw new CollectionError('Не найден элемент по ссылке ' + key + ': ' +angular.toJson(value));
	        		}
	        	} else {
		        	// здесь можно реализовать дополнительную проверку и конвертацию данных справочника
	        	}
	        	return newValue;
	        });
	    });
	    return users.construct(newItemsData, queryParams);
	};

	/*
	Метод загрузки дополнительных справочников
	Входы:
		Нет
	Выходы:
		Промис: объект, свойства которого - коллекции с разрешенными ссылками
	Необходимые зависимости:
		Дата-провайдер, который выдает данные справочников
		Загрузчики справочников, которые могут встретиться в ответе
	*/
	this.loadDirectories = function() {
		return userApi.getDirectories().then(function(directories) {
		    return _.mapValues(directories, function(itemsData, key)) {
		    	if (key === 'cities') {
		    		return citiesLoader.addItems(itemsData);
		    	} else if (key === 'groups') {
		    		return groupsLoader.addItems(itemsData);
		    	} else if (key === 'managers') {
		    		return managersLoader.addItems(itemsData);
		    	} else if (key === 'markets') {
		    		return marketsLoader.addItems(itemsData);
		    	} else if (key === 'metros') {
		    		return metrosLoader.addItems(itemsData);
		    	} else if (key === 'sites') {
		    		return sitesLoader.addItems(itemsData);
		    	} else if (key === 'statuses') {
		    		return statusesLoader.addItems(itemsData);
		    	}
		    };
		});
	};

	/*
	Метод загрузки справочника с дополнительными справочниками
	Входы:
		Параметры запроса данных
	Выходы:
		Промис: объект, свойства которого - коллекции с разрешенными ссылками
	Необходимые зависимости:
		Дата-провайдер, который выдает данные справочника
	*/
	this.loadUsers = function(queryParams) {
		var self = this;
		return self.loadDirectories().then(function(directories) {
			return _.extend(directories, userApi.query(queryParams).then(function(itemsData) {
	    		return self.addItems(itemsData);
	    	}));
		});
	};

	/*
	Метод загрузки элемента справочника с дополнительными справочниками
	Входы:
		Идентификатор элемента справочника
	Выходы:
		Промис: объект, свойства которого - коллекции с разрешенными ссылками
	Необходимые зависимости:
		Дата-провайдер, который выдает данные справочника
	*/
	this.loadUser = function(id) {
		var self = this;
		return self.loadDirectories().then(function(directories) {
			return _.extend(directories, userApi.get(id).then(function(itemsData) {
	    		return self.addItems(itemsData);
	    	}));
		});
	};
});