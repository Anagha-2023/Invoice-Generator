import React, { useState, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const GSTInvoiceGenerator = () => {
  const [invoiceData, setInvoiceData] = useState({
    companyLogo: null,
    invoiceTitle: 'TAX INVOICE',
    yourCompany: '',
    yourName: '',
    yourGSTIN: '',
    yourAddress: '',
    yourCity: '',
    yourState: '',
    yourCountry: 'India',

    clientCompany: '',
    clientGSTIN: '',
    clientAddress: '',
    clientCity: '',
    clientState: '',
    clientCountry: 'India',

    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',

    currency: 'INR',
    items: [{
      description: '',
      quantity: 1,
      rate: 0,
      sgst: 9,
      cgst: 9,
      cess: 0,
      amount: 0
    }],
    notesTitle: 'Notes',
    notes: 'It was great doing business with you.',
    termsTitle: 'Terms & Conditions',
    terms: 'Please make the payment by the due date'
  });

  const invoiceRef = useRef(null);
  const logoUploadRef = useRef(null);

  const COUNTRIES = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Germany', 'France', 'Japan', 'Singapore', 'United Arab Emirates'
  ];

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'Invoice.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 4,
        useCORS: true,
        logging: false,
        windowWidth: 1200,
        windowHeight: 1600
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    // Clone the element and modify for PDF
    const clonedElement = element.cloneNode(true);
    const addLineItemButton = clonedElement.querySelector('button[aria-label="Add Line Item"]');
    if (addLineItemButton) {
      addLineItemButton.style.display = 'none';
    }

    // Add styles to prevent text breaking
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        word-break: keep-all !important;
        page-break-inside: avoid !important;
      }
      .pdf-container {
        height: 100vh;
        overflow: hidden;
      }
    `;
    clonedElement.appendChild(style);
    clonedElement.classList.add('pdf-container');

    html2pdf().set(opt).from(clonedElement).save();
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceData(prev => ({
          ...prev,
          companyLogo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerLogoUpload = () => {
    logoUploadRef.current.click();
  };

  const handleRemoveRow = (index) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;

    if (['quantity', 'rate', 'sgst', 'cgst', 'cess'].includes(field)) {
      const { quantity, rate, sgst, cgst, cess } = newItems[index];
      newItems[index].amount = quantity * rate * (1 + (sgst + cgst + cess) / 100);
    }

    setInvoiceData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItemRow = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        quantity: 1,
        rate: 0,
        sgst: 9,
        cgst: 9,
        cess: 0,
        amount: 0
      }]
    }));
  };

  const calculateTotals = () => {
    const subTotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const totalSGST = invoiceData.items.reduce((sum, item) => sum + (item.amount * item.sgst / 100), 0);
    const totalCGST = invoiceData.items.reduce((sum, item) => sum + (item.amount * item.cgst / 100), 0);

    return {
      subTotal,
      totalSGST,
      totalCGST,
      total: subTotal + totalSGST + totalCGST
    };
  };

  const { subTotal, totalSGST, totalCGST, total } = calculateTotals();

  return (
    <div className="relative max-w-screen-md mx-auto p-4">
       <div className="absolute top-0 right-0 mt-4 mr-4">
        <button 
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
        >
          <Download className="mr-2" /> Download Invoice
        </button>
      </div>
      
      <div ref={invoiceRef} className="bg-white outline-1 outline outline-gray-300 rounded-lg p-6">
        <div className="flex justify-between mb-6">
          <div>
            {invoiceData.companyLogo ? (
              <img
                src={invoiceData.companyLogo}
                alt="Company Logo"
                className="h-20 w-20 object-contain cursor-pointer"
                onClick={triggerLogoUpload}
              />
            ) : (
              <div 
                className="h-20 w-20 border flex items-center justify-center cursor-pointer"
                onClick={triggerLogoUpload}
              >
                <Upload />
              </div>
            )}
            <input
              ref={logoUploadRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
          </div>
          <div className="text-right">
            <input
              type="text"
              value={invoiceData.invoiceTitle}
              onChange={(e) => setInvoiceData(prev => ({
                ...prev,
                invoiceTitle: e.target.value
              }))}
              className="text-5xl w-full text-right pt-5 text-gray-700 pr-5 border-none focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-36 mb-4">
            {/* Your Company Section */}
            <div className="flex-1">
              <div className="grid grid-cols-1 mb-6">
                {[
                  { key: 'yourCompany', label: 'Your Company' },
                  { key: 'yourName', label: 'Your Name' },
                  { key: 'yourGSTIN', label: "Company's GSTIN" },
                  { key: 'yourAddress', label: "Company's Address" },
                  { key: 'yourCity', label: 'City' },
                  { key: 'yourState', label: 'State' },
                  { key: 'yourCountry', label: 'Country' }
                ].map(({ key, label }) => (
                  key === 'yourCountry' ? (
                    <select
                      key={key}
                      value={invoiceData[key]}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      className="text-sm mb-1 p-1 rounded border text-gray-700 border-white hover:border hover:border-1 hover:border-blue-500 w-full"
                    >
                      {COUNTRIES.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      key={key}
                      type="text"
                      value={invoiceData[key]}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      placeholder={label}
                      className="w-full text-sm mb-1 p-1 rounded border placeholder:text-gray-500 text-gray-700 border-white hover:border hover:border-1 hover:border-blue-500"
                    />
                  )
                ))}
              </div>

              {/* Client Section */}
              <h2 className="font-medium mb-2">Bill to:</h2>
              <div className="grid grid-cols-1 mb-6">
                {[
                  { key: 'clientCompany', label: 'Client Company' },
                  { key: 'clientGSTIN', label: 'Client GSTIN' },
                  { key: 'clientAddress', label: 'Address' },
                  { key: 'clientCity', label: 'City' },
                  { key: 'clientState', label: 'State' },
                  { key: 'clientCountry', label: 'Country' }
                ].map(({ key, label }) => (
                  key === 'clientCountry' ? (
                    <select
                      key={key}
                      value={invoiceData[key]}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      className="w-full text-sm mb-1 p-1 rounded border text-gray-700 border-white hover:border hover:border-1 hover:border-blue-500"
                    >
                      {COUNTRIES.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      key={key}
                      type="text"
                      value={invoiceData[key]}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      placeholder={label}
                      className="w-full text-sm mb-1 p-1 rounded border placeholder:text-gray-500 text-gray-700 border-white hover:border hover:border-1 hover:border-blue-500"
                    />
                  )
                ))}
              </div>
            </div>

            {/* Invoice Details Section */}
            <div className="flex-1 mt-[16rem]">
              <div className="grid grid-cols-1 mb-6">
                {[
                  { key: 'invoiceNumber', label: 'Invoice#', type: 'text' },
                  { key: 'invoiceDate', label: 'Invoice Date', type: 'date' },
                  { key: 'dueDate', label: 'Due Date', type: 'date' }
                ].map(({ key, label, type }) => (
                  <div key={key} className="flex items-center mb-1">
                    <label htmlFor={key} className="text-sm text-gray-700 font-extrabold w-1/3">{label}</label>
                    <input
                      id={key}
                      type={type}
                      value={invoiceData[key]}
                      onChange={(e) => setInvoiceData(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      placeholder={label}
                      className="border text-sm text-gray-700 p-1 rounded w-2/3 border-white hover:border-blue-500 placeholder:text-gray-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full border mb-6">
          <thead>
            <tr className="bg-black">
              {['Item Description', 'Qty', 'Rate', 'SGST(%)', 'CGST(%)', 'Cess(%)', 'Amount', ''].map((header, index) => (
                <th key={index} className="pl-2 pr-2 text-white text-sm border">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 group relative"
              >
                {[
                  { key: 'description', type: 'text' },
                  { key: 'quantity', type: 'number' },
                  { key: 'rate', type: 'number' },
                  { key: 'sgst', type: 'number' },
                  { key: 'cgst', type: 'number' },
                  { key: 'cess', type: 'number' },
                ].map(({ key, type }) => (
                  <td key={key} className="p-2 border">
                    <input
                      type={type}
                      value={item[key]}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          key,
                          type === 'number' ? parseFloat(e.target.value) : e.target.value
                        )
                      }
                      placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                      className="w-full p-1 rounded"
                    />
                  </td>
                ))}
                <td className="p-2 border text-right">{item.amount.toFixed(2)}</td>
                <td className="p-2 border relative">
                  <button
                    onClick={() => handleRemoveRow(index)}
                    className="absolute top-1/2 right-1 transform -translate-y-1/2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={addItemRow}
          aria-label="Add Line Item"
          className="mb-4 px-4 py-2 flex items-center text-blue-500 rounded"
        >
          <span className="flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-blue-500 text-white text-xl">
            +
          </span>
          Add Line Item
        </button>


        <div className="grid grid-cols-2 gap-4">
          <div></div>
          <div className="text-right">
            <div className="grid grid-cols-3 gap-2 text-gray-600 mb-4">
              <span>Sub Total</span>
              <span className="col-span-2 text-gray-900 font-medium">{subTotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <span className="text-gray-600">SGST</span>
              <input
                type="number"
                value={(totalSGST / subTotal * 100).toFixed(2)}
                readOnly
                className="col-span-2 text-end p-1 rounded text-gray-900 font-medium"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <span className="text-gray-600">CGST</span>
              <input
                type="number"
                value={(totalCGST / subTotal * 100).toFixed(2)}
                readOnly
                className="col-span-2 text-end p-1 rounded text-gray-900 font-medium"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <span className="text-gray-600">Total</span>
              <select
                value={invoiceData.currency}
                onChange={(e) => setInvoiceData(prev => ({
                  ...prev,
                  currency: e.target.value
                }))}
                className="ml-20 p-1 w-1/2 rounded text-gray-600"
              >
                <option value="INR">₹</option>
                <option value="USD">$</option>
                <option value="EUR">€</option>
              </select>
              <span className="text-gray-900 font-medium">{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="mt-6  pt-4">
  {/* Notes Section */}
<div className="mb-2">
  <input
    type="text"
    value={invoiceData.notesTitle}
    onChange={(e) => setInvoiceData(prev => ({ ...prev, notesTitle: e.target.value }))}
    placeholder="Notes"
    className="w-full text-gray-600 text-sm font-semibold hover:border-blue-500 hover:border mb-2 p-1 rounded placeholder:text-gray-600"
  />
  <textarea
    value={invoiceData.notes}
    onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
    placeholder="It was great doing business with you."
    className="w-full rounded text-sm text-gray-900 hover:border-blue-500 hover:border placeholder:text-gray-600 pl-2 pt-1"
  />
</div>

{/* Terms & Conditions Section */}
<div>
  <input
    type="text"
    value={invoiceData.termsTitle}
    onChange={(e) => setInvoiceData(prev => ({ ...prev, termsTitle: e.target.value }))}
    placeholder="Terms & Conditions"
    className="w-full text-gray-600 text-sm font-semibold mb-2 p-1 rounded placeholder:text-gray-600 hover:border-blue-500 hover:border"
  />
  <textarea
    value={invoiceData.terms}
    onChange={(e) => setInvoiceData(prev => ({ ...prev, terms: e.target.value }))}
    placeholder="Please make the payment by the due date"
    className="w-full rounded text-sm text-gray-900 placeholder:text-gray-600 pl-2 pt-1 hover:border-blue-500 hover:border"
  />
</div>

</div>


      </div>
    </div>
  );
};

export default GSTInvoiceGenerator;