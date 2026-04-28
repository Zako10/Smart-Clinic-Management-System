using SmartClinic.Application.DTOs.Invoice;

namespace SmartClinic.Application.Interfaces;

public interface IInvoiceService
{
    Task<IEnumerable<InvoiceDto>> GetAll();
    Task Add(CreateInvoiceDto dto);
}
