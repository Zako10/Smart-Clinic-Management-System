using SmartClinic.Application.DTOs.Invoice;

namespace SmartClinic.Application.Interfaces;

public interface IInvoiceService
{
    Task<IEnumerable<InvoiceDto>> GetAll();
    Task<InvoiceDto?> GetById(int id);
    Task Add(CreateInvoiceDto dto);
    Task Update(int id, CreateInvoiceDto dto);
    Task Delete(int id);
}
