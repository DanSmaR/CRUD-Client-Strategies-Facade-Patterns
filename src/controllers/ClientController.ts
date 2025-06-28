import express from 'express';
import { Client } from '../domain/entities/Client';
import { Facade } from './Facade';
import { Address } from '../domain/entities/Address';
import { City } from '../domain/entities/City';
import { State } from '../domain/entities/State';
import { Country } from '../domain/entities/Country';
import { Phone, PhoneType } from '../domain/entities/Phone';
import { Gender } from '../domain/entities/Gender';
import { ResidenceType, StreetType, AddressType } from '../domain/entities/AddressTypes';
import { ClientFilter } from '../domain/interfaces/ClientFilter';

export class ClientController {
  private facade: Facade;
  private readonly ENTITY_TYPE = 'Client';
  
  constructor(facade: Facade) {
    this.facade = facade;
  }

  async index(req: express.Request, res: express.Response): Promise<void> {
    try {
      const filter = this.buildFilterFromQuery(req.query);
      const clients = await this.getClientsWithFilter(filter);
      
      this.renderClientList(res, clients, req.query);
    } catch (error) {
      this.renderError(res, 'Erro ao listar clientes', error);
    }
  }
  
  new(req: express.Request, res: express.Response): void {
    res.render('clients/new', {
      title: 'Novo Cliente',
      ...this.getFormSelectOptions()
    });
  }

  async create(req: express.Request, res: express.Response): Promise<void> {
    try {
      const client = this.constructClientObject(req.body);
      const result = await this.facade.save(client);
      
      if (result === "Cliente salvo com sucesso") {
        res.redirect(`/clients/${client.id}`);
      } else {
        this.renderNewForm(res, result, req.body);
      }
    } catch (error) {
      this.renderError(res, 'Erro ao criar cliente', error);
    }
  }

  async show(req: express.Request, res: express.Response): Promise<void> {
    try {
      const client = await this.findClientById(req.params.id, res);
      if (!client) return; // Erro já renderizado em findClientById
      
      res.render('clients/show', { 
        title: 'Detalhes do Cliente',
        client 
      });
    } catch (error) {
      this.renderError(res, 'Erro ao buscar cliente', error);
    }
  }
  
  async edit(req: express.Request, res: express.Response): Promise<void> {
    try {
      const client = await this.findClientById(req.params.id, res);
      if (!client) return; // Erro já renderizado em findClientById
      
      res.render('clients/edit', { 
        title: 'Editar Cliente',
        client,
        ...this.getFormSelectOptions()
      });
    } catch (error) {
      this.renderError(res, 'Erro ao buscar cliente para edição', error);
    }
  }
  
  async update(req: express.Request, res: express.Response): Promise<void> {
    try {
      const existingClient = await this.findClientById(req.params.id, res) as Client;
      if (!existingClient) return; // Erro já renderizado em findClientById
      
      this.updateClientDetails(existingClient, req.body);
      const result = await this.facade.update(existingClient);
      
      if (result === "Cliente atualizado com sucesso") {
        res.redirect(`/clients/${req.params.id}`);
      } else {
        res.render('clients/edit', { 
          title: 'Editar Cliente',
          error: result, 
          client: existingClient,
          ...this.getFormSelectOptions()
        });
      }
    } catch (error) {
      this.renderError(res, 'Erro ao atualizar cliente', error);
    }
  }

  async delete(req: express.Request, res: express.Response): Promise<void> {
    try {
      const result = await this.facade.delete(req.params.id, this.ENTITY_TYPE);
      
      if (result === "Cliente removido com sucesso") {
        res.redirect('/clients');
      } else {
        this.renderError(res, result, null, 400);
      }
    } catch (error) {
      this.renderError(res, 'Erro ao remover cliente', error);
    }
  }

  async activate(req: express.Request, res: express.Response): Promise<void> {
    try {
      const client = await this.findClientById(req.params.id, res) as Client;
      if (!client) return; // Erro já renderizado em findClientById
      
      client.isActive = true;
      const result = await this.facade.update(client);
      
      if (result === "Cliente atualizado com sucesso") {
        res.redirect(`/clients/${req.params.id}`);
      } else {
        this.renderError(res, result, null, 400);
      }
    } catch (error) {
      this.renderError(res, 'Erro ao ativar cliente', error);
    }
  }

  async deactivate(req: express.Request, res: express.Response): Promise<void> {
    try {
      const client = await this.findClientById(req.params.id, res) as Client;
      if (!client) return; // Erro já renderizado em findClientById
      
      client.deactivate();
      const result = await this.facade.update(client);
      
      if (result === "Cliente atualizado com sucesso") {
        res.redirect(`/clients/${req.params.id}`);
      } else {
        this.renderError(res, result, null, 400);
      }
    } catch (error) {
      this.renderError(res, 'Erro ao desativar cliente', error);
    }
  }

  // Métodos auxiliares para responsabilidade única

  /**
   * Renderiza a lista de clientes
   */
  private renderClientList(res: express.Response, clients: Client[], filter: any): void {
    res.render('clients/index', { 
      title: 'Lista de Clientes',
      clients,
      filter,
      genders: Object.values(Gender),
      phoneTypes: Object.values(PhoneType)
    });
  }

  /**
   * Renderiza o formulário de novo cliente com erro
   */
  private renderNewForm(res: express.Response, error: string, formData: any): void {
    res.render('clients/new', { 
      title: 'Novo Cliente',
      error, 
      client: formData,
      ...this.getFormSelectOptions()
    });
  }

  /**
   * Renderiza uma página de erro
   */
  private renderError(res: express.Response, message: string, error: any = null, status: number = 500): void {
    res.status(status).render('error', { 
      title: 'Erro',
      message, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }

  /**
   * Busca um cliente pelo ID e trata o caso de não encontrado
   */
  private async findClientById(id: string, res: express.Response): Promise<Client | null> {
    const client = await this.facade.findById(id, this.ENTITY_TYPE) as Client;
    
    if (!client) {
      res.status(404).render('error', { 
        title: 'Cliente Não Encontrado',
        message: 'Cliente não encontrado' 
      });
      return null;
    }
    
    return client;
  }

  /**
   * Retorna as opções para os selects dos formulários
   */
  private getFormSelectOptions(): object {
    return {
      genders: Object.values(Gender),
      phoneTypes: Object.values(PhoneType),
      residenceTypes: Object.values(ResidenceType),
      streetTypes: Object.values(StreetType),
      addressTypes: Object.values(AddressType)
    };
  }

  /**
   * Constrói um objeto de filtro a partir dos parâmetros da query
   */
  private buildFilterFromQuery(query: any): ClientFilter | null {
    const {
      name, cpf, email, gender, isActive,
      phoneType, areaCode, phoneNumber,
      birthDateFrom, birthDateTo, createdAtFrom, createdAtTo,
      street, neighborhood, zipCode, city, state, country,
      ageFrom, ageTo
    } = query;
    
    // Check if any filter is applied
    const hasFilter = !!(name || cpf || email || (gender && gender !== '') || (isActive && isActive !== '') ||
                        (phoneType && phoneType !== '') || areaCode || phoneNumber ||
                        birthDateFrom || birthDateTo || createdAtFrom || createdAtTo ||
                        street || neighborhood || zipCode || city || state || country ||
                        ageFrom || ageTo);
    
    if (!hasFilter) return null;
    
    const filter: ClientFilter = {};
    
    // Basic filters
    if (name) filter.name = String(name);
    if (cpf) filter.cpf = String(cpf);
    if (email) filter.email = String(email);
    if (gender && gender !== '') filter.gender = gender as Gender;
    if (isActive && isActive !== '') filter.isActive = isActive === 'true';
    
    // Phone filters
    if (phoneType && phoneType !== '') filter.phoneType = phoneType as PhoneType;
    if (areaCode) filter.areaCode = String(areaCode);
    if (phoneNumber) filter.phoneNumber = String(phoneNumber);
    
    // Date filters
    if (birthDateFrom) filter.birthDateFrom = new Date(String(birthDateFrom));
    if (birthDateTo) filter.birthDateTo = new Date(String(birthDateTo));
    if (createdAtFrom) filter.createdAtFrom = new Date(String(createdAtFrom));
    if (createdAtTo) filter.createdAtTo = new Date(String(createdAtTo));
    
    // Address filters
    if (street) filter.street = String(street);
    if (neighborhood) filter.neighborhood = String(neighborhood);
    if (zipCode) filter.zipCode = String(zipCode);
    if (city) filter.city = String(city);
    if (state) filter.state = String(state);
    if (country) filter.country = String(country);
    
    // Age filters
    if (ageFrom) filter.ageFrom = parseInt(String(ageFrom));
    if (ageTo) filter.ageTo = parseInt(String(ageTo));
    
    return filter;
  }

  /**
   * Busca clientes com ou sem filtro
   */
  private async getClientsWithFilter(filter: ClientFilter | null): Promise<Client[]> {
    if (filter) {
      return await this.facade.findByFilter(filter, this.ENTITY_TYPE) as Client[];
    } else {
      return await this.facade.findAll(this.ENTITY_TYPE) as Client[];
    }
  }

  /**
   * Atualiza os detalhes de um cliente existente
   */
  private updateClientDetails(existingClient: Client, data: any): void {
    // Update basic info
    existingClient.name = data.name;
    existingClient.cpf = data.cpf;
    existingClient.gender = data.gender as Gender;
    existingClient.birthDate = new Date(data.birthDate);
    existingClient.email = data.email;
    existingClient.password = data.password;
    existingClient.phone.type = data.phoneType as PhoneType;
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
  private updateResidentialAddress(client: Client, data: any): void {
    const resCountry = new Country(data.resCountry);
    const resState = new State(data.resState, resCountry);
    const resCity = new City(data.resCity, resState);
    
    client.residentialAddress.residenceType = data.resResidenceType as ResidenceType;
    client.residentialAddress.streetType = data.resStreetType as StreetType;
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
  private processResidentialAsOtherAddresses(client: Client, data: any): void {
    // If using residential as billing, add it
    if (data.useResidentialAsBilling === 'true') {
      const billingAddress = this.createAddressFromResidential(client.residentialAddress, AddressType.COBRANCA);
      client.billingAddresses.push(billingAddress);
    }
    
    // If using residential as delivery, add it
    if (data.useResidentialAsDelivery === 'true') {
      const deliveryAddress = this.createAddressFromResidential(client.residentialAddress, AddressType.ENTREGA);
      client.deliveryAddresses.push(deliveryAddress);
    }
  }

  /**
   * Cria um novo endereço baseado no endereço residencial
   */
  private createAddressFromResidential(residentialAddress: Address, type: AddressType): Address {
    return new Address(
      residentialAddress.residenceType,
      residentialAddress.streetType,
      residentialAddress.street,
      residentialAddress.number,
      residentialAddress.neighborhood,
      residentialAddress.zipCode,
      residentialAddress.city,
      type,
      residentialAddress.observations
    );
  }

  /**
   * Constrói um objeto cliente a partir dos dados do formulário
   */
  private constructClientObject(data: any): Client {
    const resCountry = new Country(data.resCountry);
    const resState = new State(data.resState, resCountry);
    const resCity = new City(data.resCity, resState);
    
    const residentialAddress = new Address(
      data.resResidenceType as ResidenceType,
      data.resStreetType as StreetType,
      data.resStreet,
      data.resNumber,
      data.resNeighborhood,
      data.resZipCode,
      resCity,
      AddressType.RESIDENCIAL,
      data.resObservations || ''
    );

    const phone = new Phone(
      data.phoneType as PhoneType,
      data.areaCode || '11',
      data.phone
    );

    const billingAddresses: Address[] = [];
    const deliveryAddresses: Address[] = [];

    // If using residential as billing, add it
    if (data.useResidentialAsBilling === 'true') {
      const billingAddress = this.createAddressFromResidential(residentialAddress, AddressType.COBRANCA);
      billingAddresses.push(billingAddress);
    }

    // If using residential as delivery, add it
    if (data.useResidentialAsDelivery === 'true') {
      const deliveryAddress = this.createAddressFromResidential(residentialAddress, AddressType.ENTREGA);
      deliveryAddresses.push(deliveryAddress);
    }

    const client = new Client(
      data.name,
      data.cpf,
      data.gender as Gender,
      new Date(data.birthDate),
      phone,
      data.email,
      data.password,
      residentialAddress,
      billingAddresses,
      deliveryAddresses
    );

    // Add additional billing and delivery addresses
    this.processBillingAddresses(client, data.billingAddresses);
    this.processDeliveryAddresses(client, data.deliveryAddresses);

    return client;
  }

  /**
   * Processa endereços de cobrança adicionais
   */
  private processBillingAddresses(client: Client, billingAddresses: any): void {
    if (billingAddresses && Array.isArray(billingAddresses)) {
      for (const addr of billingAddresses) {
        if (addr.street && addr.zipCode && addr.city && addr.state && addr.country) {
          const country = new Country(addr.country);
          const state = new State(addr.state, country);
          const city = new City(addr.city, state);
          
          const billingAddress = new Address(
            addr.residenceType as ResidenceType,
            addr.streetType as StreetType,
            addr.street,
            addr.number,
            addr.neighborhood,
            addr.zipCode,
            city,
            AddressType.COBRANCA,
            addr.observations || ''
          );
          client.billingAddresses.push(billingAddress);
        }
      }
    }
  }

  /**
   * Processa endereços de entrega adicionais
   */
  private processDeliveryAddresses(client: Client, deliveryAddresses: any): void {
    if (deliveryAddresses && Array.isArray(deliveryAddresses)) {
      for (const addr of deliveryAddresses) {
        if (addr.street && addr.zipCode && addr.city && addr.state && addr.country) {
          const country = new Country(addr.country);
          const state = new State(addr.state, country);
          const city = new City(addr.city, state);
          
          const deliveryAddress = new Address(
            addr.residenceType as ResidenceType,
            addr.streetType as StreetType,
            addr.street,
            addr.number,
            addr.neighborhood,
            addr.zipCode,
            city,
            AddressType.ENTREGA,
            addr.observations || ''
          );
          client.deliveryAddresses.push(deliveryAddress);
        }
      }
    }
  }
}
