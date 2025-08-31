import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISupplierService } from './interfaces/supplier.service.interface';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class SupplierService implements ISupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly logger: LoggerService,
  ) {}

  async create(
    createSupplierDto: CreateSupplierDto,
  ): Promise<SupplierResponseDto> {
    try {
      this.logger.log(
        `Attempting to create supplier: ${createSupplierDto.name}`,
      );

      // Check if supplier already exists
      const existingSupplier = await this.supplierRepository.findOne({
        where: { name: createSupplierDto.name },
      });

      if (existingSupplier) {
        const errorMsg = `Supplier with this name already exists: ${createSupplierDto.name}`;
        throw new CustomException(
          'Supplier with this name already exists',
          HttpStatus.CONFLICT,
          errorMsg,
        );
      }

      // Create new supplier entity
      const newSupplier = this.supplierRepository.create({
        name: createSupplierDto.name,
        contact_person: createSupplierDto.contact_person,
        email: createSupplierDto.email,
        phone: createSupplierDto.phone,
        address: createSupplierDto.address,
      });

      // Save the supplier
      const savedSupplier = await this.supplierRepository.save(newSupplier);
      this.logger.log(
        `Successfully created supplier with ID: ${savedSupplier.id}`,
      );

      // Construct response
      const supplierResponse: SupplierResponseDto = {
        id: savedSupplier.id,
        name: savedSupplier.name,
        contact_person: savedSupplier.contact_person,
        email: savedSupplier.email,
        phone: savedSupplier.phone,
        address: savedSupplier.address,
        created_at: savedSupplier.created_at,
        updated_at: savedSupplier.updated_at,
      };

      return supplierResponse;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during supplier creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in create function: ${errorMessage}`,
      );
    }
  }

  async findAll(): Promise<SupplierResponseDto[]> {
    try {
      this.logger.log('Fetching all suppliers');

      // Find all suppliers
      const suppliers = await this.supplierRepository.find({
        order: { name: 'ASC' },
      });

      this.logger.log(`Successfully fetched ${suppliers.length} suppliers`);

      // Map to response DTOs
      const supplierResponses: SupplierResponseDto[] = suppliers.map(
        (supplier) => ({
          id: supplier.id,
          name: supplier.name,
          contact_person: supplier.contact_person,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          created_at: supplier.created_at,
          updated_at: supplier.updated_at,
        }),
      );

      return supplierResponses;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while fetching all suppliers',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findAll function: ${errorMessage}`,
      );
    }
  }

  async update(
    id: number,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    try {
      this.logger.log(`Attempting to update supplier ID: ${id}`);

      // Find supplier by ID
      const supplier = await this.supplierRepository.findOne({
        where: { id },
      });

      // If supplier not found, throw exception
      if (!supplier) {
        const errorMsg = `Supplier not found with ID: ${id}`;
        throw new CustomException(
          'Supplier not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Check if name is being updated and if it already exists
      if (updateSupplierDto.name && updateSupplierDto.name !== supplier.name) {
        const existingSupplier = await this.supplierRepository.findOne({
          where: { name: updateSupplierDto.name },
        });

        if (existingSupplier) {
          const errorMsg = `Supplier with this name already exists: ${updateSupplierDto.name}`;
          throw new CustomException(
            'Supplier with this name already exists',
            HttpStatus.CONFLICT,
            errorMsg,
          );
        }
      }

      // Update supplier properties
      if (updateSupplierDto.name !== undefined) {
        supplier.name = updateSupplierDto.name;
      }
      if (updateSupplierDto.contact_person !== undefined) {
        supplier.contact_person = updateSupplierDto.contact_person;
      }
      if (updateSupplierDto.email !== undefined) {
        supplier.email = updateSupplierDto.email;
      }
      if (updateSupplierDto.phone !== undefined) {
        supplier.phone = updateSupplierDto.phone;
      }
      if (updateSupplierDto.address !== undefined) {
        supplier.address = updateSupplierDto.address;
      }

      // Save the updated supplier
      const updatedSupplier = await this.supplierRepository.save(supplier);
      this.logger.log(
        `Successfully updated supplier with ID: ${updatedSupplier.id}`,
      );

      // Construct response
      const supplierResponse: SupplierResponseDto = {
        id: updatedSupplier.id,
        name: updatedSupplier.name,
        contact_person: updatedSupplier.contact_person,
        email: updatedSupplier.email,
        phone: updatedSupplier.phone,
        address: updatedSupplier.address,
        created_at: updatedSupplier.created_at,
        updated_at: updatedSupplier.updated_at,
      };

      return supplierResponse;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during supplier update',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in update function: ${errorMessage}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      this.logger.log(`Attempting to remove supplier ID: ${id}`);

      // Find supplier by ID
      const supplier = await this.supplierRepository.findOne({
        where: { id },
      });

      // If supplier not found, throw exception
      if (!supplier) {
        const errorMsg = `Supplier not found with ID: ${id}`;
        throw new CustomException(
          'Supplier not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Remove the supplier
      await this.supplierRepository.remove(supplier);
      this.logger.log(`Successfully removed supplier with ID: ${id}`);
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during supplier removal',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in remove function: ${errorMessage}`,
      );
    }
  }
}
