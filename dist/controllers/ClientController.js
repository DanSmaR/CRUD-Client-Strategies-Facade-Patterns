"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const Client_1 = require("../domain/entities/Client");
const Address_1 = require("../domain/entities/Address");
const City_1 = require("../domain/entities/City");
const State_1 = require("../domain/entities/State");
const Country_1 = require("../domain/entities/Country");
const Phone_1 = require("../domain/entities/Phone");
const Gender_1 = require("../domain/entities/Gender");
const AddressTypes_1 = require("../domain/entities/AddressTypes");
class ClientController {
    constructor(facade) {
        this.ENTITY_TYPE = 'Client';
        this.facade = facade;
    }
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filter = this.buildFilterFromQuery(req.query);
                const clients = yield this.getClientsWithFilter(filter);
                this.renderClientList(res, clients, req.query);
            }
            catch (error) {
                this.renderError(res, 'Erro ao listar clientes', error);
            }
        });
    }
    new(req, res) {
        res.render('clients/new', Object.assign({ title: 'Novo Cliente' }, this.getFormSelectOptions()));
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = this.constructClientObject(req.body);
                const result = yield this.facade.save(client);
                if (result === "Cliente salvo com sucesso") {
                    res.redirect('/clients');
                }
                else {
                    this.renderNewForm(res, result, req.body);
                }
            }
            catch (error) {
                this.renderError(res, 'Erro ao criar cliente', error);
            }
        });
    }
    show(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield this.findClientById(req.params.id, res);
                if (!client)
                    return; // Erro já renderizado em findClientById
                res.render('clients/show', {
                    title: 'Detalhes do Cliente',
                    client
                });
            }
            catch (error) {
                this.renderError(res, 'Erro ao buscar cliente', error);
            }
        });
    }
    edit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield this.findClientById(req.params.id, res);
                if (!client)
                    return; // Erro já renderizado em findClientById
                res.render('clients/edit', Object.assign({ title: 'Editar Cliente', client }, this.getFormSelectOptions()));
            }
            catch (error) {
                this.renderError(res, 'Erro ao buscar cliente para edição', error);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingClient = yield this.findClientById(req.params.id, res);
                if (!existingClient)
                    return; // Erro já renderizado em findClientById
                this.updateClientDetails(existingClient, req.body);
                const result = yield this.facade.update(existingClient);
                if (result === "Cliente atualizado com sucesso") {
                    res.redirect(`/clients/${req.params.id}`);
                }
                else {
                    res.render('clients/edit', Object.assign({ title: 'Editar Cliente', error: result, client: existingClient }, this.getFormSelectOptions()));
                }
            }
            catch (error) {
                this.renderError(res, 'Erro ao atualizar cliente', error);
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.facade.delete(req.params.id, this.ENTITY_TYPE);
                if (result === "Cliente removido com sucesso") {
                    res.redirect('/clients');
                }
                else {
                    this.renderError(res, result, null, 400);
                }
            }
            catch (error) {
                this.renderError(res, 'Erro ao remover cliente', error);
            }
        });
    }
    activate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield this.findClientById(req.params.id, res);
                if (!client)
                    return; // Erro já renderizado em findClientById
                client.isActive = true;
                const result = yield this.facade.update(client);
                if (result === "Cliente atualizado com sucesso") {
                    res.redirect(`/clients/${req.params.id}`);
                }
                else {
                    this.renderError(res, result, null, 400);
                }
            }
            catch (error) {
                this.renderError(res, 'Erro ao ativar cliente', error);
            }
        });
    }
    deactivate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = yield this.findClientById(req.params.id, res);
                if (!client)
                    return; // Erro já renderizado em findClientById
                client.deactivate();
                const result = yield this.facade.update(client);
                if (result === "Cliente atualizado com sucesso") {
                    res.redirect(`/clients/${req.params.id}`);
                }
                else {
                    this.renderError(res, result, null, 400);
                }
            }
            catch (error) {
                this.renderError(res, 'Erro ao desativar cliente', error);
            }
        });
    }
    // Métodos auxiliares para responsabilidade única
    /**
     * Renderiza a lista de clientes
     */
    renderClientList(res, clients, filter) {
        res.render('clients/index', {
            title: 'Lista de Clientes',
            clients,
            filter,
            genders: Object.values(Gender_1.Gender),
            phoneTypes: Object.values(Phone_1.PhoneType)
        });
    }
    /**
     * Renderiza o formulário de novo cliente com erro
     */
    renderNewForm(res, error, formData) {
        res.render('clients/new', Object.assign({ title: 'Novo Cliente', error, client: formData }, this.getFormSelectOptions()));
    }
    /**
     * Renderiza uma página de erro
     */
    renderError(res, message, error = null, status = 500) {
        res.status(status).render('error', {
            title: 'Erro',
            message,
            error: error instanceof Error ? error.message : String(error)
        });
    }
    /**
     * Busca um cliente pelo ID e trata o caso de não encontrado
     */
    findClientById(id, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.facade.findById(id, this.ENTITY_TYPE);
            if (!client) {
                res.status(404).render('error', {
                    title: 'Cliente Não Encontrado',
                    message: 'Cliente não encontrado'
                });
                return null;
            }
            return client;
        });
    }
    /**
     * Retorna as opções para os selects dos formulários
     */
    getFormSelectOptions() {
        return {
            genders: Object.values(Gender_1.Gender),
            phoneTypes: Object.values(Phone_1.PhoneType),
            residenceTypes: Object.values(AddressTypes_1.ResidenceType),
            streetTypes: Object.values(AddressTypes_1.StreetType),
            addressTypes: Object.values(AddressTypes_1.AddressType)
        };
    }
    /**
     * Constrói um objeto de filtro a partir dos parâmetros da query
     */
    buildFilterFromQuery(query) {
        const { name, cpf, email, gender, isActive, phoneType, areaCode, phoneNumber, birthDateFrom, birthDateTo, createdAtFrom, createdAtTo, street, neighborhood, zipCode, city, state, country, ageFrom, ageTo } = query;
        // Check if any filter is applied
        const hasFilter = !!(name || cpf || email || gender || isActive !== undefined ||
            phoneType || areaCode || phoneNumber ||
            birthDateFrom || birthDateTo || createdAtFrom || createdAtTo ||
            street || neighborhood || zipCode || city || state || country ||
            ageFrom || ageTo);
        if (!hasFilter)
            return null;
        const filter = {};
        // Basic filters
        if (name)
            filter.name = String(name);
        if (cpf)
            filter.cpf = String(cpf);
        if (email)
            filter.email = String(email);
        if (gender)
            filter.gender = gender;
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        // Phone filters
        if (phoneType)
            filter.phoneType = phoneType;
        if (areaCode)
            filter.areaCode = String(areaCode);
        if (phoneNumber)
            filter.phoneNumber = String(phoneNumber);
        // Date filters
        if (birthDateFrom)
            filter.birthDateFrom = new Date(String(birthDateFrom));
        if (birthDateTo)
            filter.birthDateTo = new Date(String(birthDateTo));
        if (createdAtFrom)
            filter.createdAtFrom = new Date(String(createdAtFrom));
        if (createdAtTo)
            filter.createdAtTo = new Date(String(createdAtTo));
        // Address filters
        if (street)
            filter.street = String(street);
        if (neighborhood)
            filter.neighborhood = String(neighborhood);
        if (zipCode)
            filter.zipCode = String(zipCode);
        if (city)
            filter.city = String(city);
        if (state)
            filter.state = String(state);
        if (country)
            filter.country = String(country);
        // Age filters
        if (ageFrom)
            filter.ageFrom = parseInt(String(ageFrom));
        if (ageTo)
            filter.ageTo = parseInt(String(ageTo));
        return filter;
    }
    /**
     * Busca clientes com ou sem filtro
     */
    getClientsWithFilter(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            if (filter) {
                return yield this.facade.findByFilter(filter, this.ENTITY_TYPE);
            }
            else {
                return yield this.facade.findAll(this.ENTITY_TYPE);
            }
        });
    }
    /**
     * Atualiza os detalhes de um cliente existente
     */
    updateClientDetails(existingClient, data) {
        // Update basic info
        existingClient.name = data.name;
        existingClient.cpf = data.cpf;
        existingClient.gender = data.gender;
        existingClient.birthDate = new Date(data.birthDate);
        existingClient.email = data.email;
        existingClient.password = data.password;
        existingClient.phone.type = data.phoneType;
        existingClient.phone.areaCode = data.areaCode || existingClient.phone.areaCode;
        existingClient.phone.number = data.phone;
        // Update residential address
        this.updateResidentialAddress(existingClient, data);
        // Clear existing addresses before repopulating
        existingClient.billingAddresses = [];
        existingClient.deliveryAddresses = [];
        // Process residential address as billing/delivery if needed
        this.processResidentialAsOtherAddresses(existingClient, data);
        // Add additional addresses
        this.processBillingAddresses(existingClient, data.billingAddresses);
        this.processDeliveryAddresses(existingClient, data.deliveryAddresses);
    }
    /**
     * Atualiza o endereço residencial do cliente
     */
    updateResidentialAddress(client, data) {
        const resCountry = new Country_1.Country(data.resCountry);
        const resState = new State_1.State(data.resState, resCountry);
        const resCity = new City_1.City(data.resCity, resState);
        client.residentialAddress.residenceType = data.resResidenceType;
        client.residentialAddress.streetType = data.resStreetType;
        client.residentialAddress.street = data.resStreet;
        client.residentialAddress.number = data.resNumber;
        client.residentialAddress.neighborhood = data.resNeighborhood;
        client.residentialAddress.zipCode = data.resZipCode;
        client.residentialAddress.city = resCity;
        client.residentialAddress.observations = data.resObservations || '';
    }
    /**
     * Processa o endereço residencial como cobrança/entrega se necessário
     */
    processResidentialAsOtherAddresses(client, data) {
        // If using residential as billing, add it
        if (data.useResidentialAsBilling === 'true') {
            const billingAddress = this.createAddressFromResidential(client.residentialAddress, AddressTypes_1.AddressType.COBRANCA);
            client.billingAddresses.push(billingAddress);
        }
        // If using residential as delivery, add it
        if (data.useResidentialAsDelivery === 'true') {
            const deliveryAddress = this.createAddressFromResidential(client.residentialAddress, AddressTypes_1.AddressType.ENTREGA);
            client.deliveryAddresses.push(deliveryAddress);
        }
    }
    /**
     * Cria um novo endereço baseado no endereço residencial
     */
    createAddressFromResidential(residentialAddress, type) {
        return new Address_1.Address(residentialAddress.residenceType, residentialAddress.streetType, residentialAddress.street, residentialAddress.number, residentialAddress.neighborhood, residentialAddress.zipCode, residentialAddress.city, type, residentialAddress.observations);
    }
    /**
     * Constrói um objeto cliente a partir dos dados do formulário
     */
    constructClientObject(data) {
        const resCountry = new Country_1.Country(data.resCountry);
        const resState = new State_1.State(data.resState, resCountry);
        const resCity = new City_1.City(data.resCity, resState);
        const residentialAddress = new Address_1.Address(data.resResidenceType, data.resStreetType, data.resStreet, data.resNumber, data.resNeighborhood, data.resZipCode, resCity, AddressTypes_1.AddressType.RESIDENCIAL, data.resObservations || '');
        const phone = new Phone_1.Phone(data.phoneType, data.areaCode || '11', data.phone);
        const billingAddresses = [];
        const deliveryAddresses = [];
        // If using residential as billing, add it
        if (data.useResidentialAsBilling === 'true') {
            const billingAddress = this.createAddressFromResidential(residentialAddress, AddressTypes_1.AddressType.COBRANCA);
            billingAddresses.push(billingAddress);
        }
        // If using residential as delivery, add it
        if (data.useResidentialAsDelivery === 'true') {
            const deliveryAddress = this.createAddressFromResidential(residentialAddress, AddressTypes_1.AddressType.ENTREGA);
            deliveryAddresses.push(deliveryAddress);
        }
        const client = new Client_1.Client(data.name, data.cpf, data.gender, new Date(data.birthDate), phone, data.email, data.password, residentialAddress, billingAddresses, deliveryAddresses);
        // Add additional billing and delivery addresses
        this.processBillingAddresses(client, data.billingAddresses);
        this.processDeliveryAddresses(client, data.deliveryAddresses);
        return client;
    }
    /**
     * Processa endereços de cobrança adicionais
     */
    processBillingAddresses(client, billingAddresses) {
        if (billingAddresses && Array.isArray(billingAddresses)) {
            for (const addr of billingAddresses) {
                if (addr.street && addr.zipCode && addr.city && addr.state && addr.country) {
                    const country = new Country_1.Country(addr.country);
                    const state = new State_1.State(addr.state, country);
                    const city = new City_1.City(addr.city, state);
                    const billingAddress = new Address_1.Address(addr.residenceType, addr.streetType, addr.street, addr.number, addr.neighborhood, addr.zipCode, city, AddressTypes_1.AddressType.COBRANCA, addr.observations || '');
                    client.billingAddresses.push(billingAddress);
                }
            }
        }
    }
    /**
     * Processa endereços de entrega adicionais
     */
    processDeliveryAddresses(client, deliveryAddresses) {
        if (deliveryAddresses && Array.isArray(deliveryAddresses)) {
            for (const addr of deliveryAddresses) {
                if (addr.street && addr.zipCode && addr.city && addr.state && addr.country) {
                    const country = new Country_1.Country(addr.country);
                    const state = new State_1.State(addr.state, country);
                    const city = new City_1.City(addr.city, state);
                    const deliveryAddress = new Address_1.Address(addr.residenceType, addr.streetType, addr.street, addr.number, addr.neighborhood, addr.zipCode, city, AddressTypes_1.AddressType.ENTREGA, addr.observations || '');
                    client.deliveryAddresses.push(deliveryAddress);
                }
            }
        }
    }
}
exports.ClientController = ClientController;
