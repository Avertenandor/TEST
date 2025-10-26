    }
    
    .amount-btn {
        background: rgba(255, 107, 53, 0.1);
        color: #ff6b35;
        border: 1px solid #ff6b35;
        padding: 0.8rem;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .amount-btn:hover, .amount-btn.active {
        background: #ff6b35;
        color: white;
    }
    
    .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #333;
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
    
    .btn-primary, .btn-secondary {
        padding: 0.8rem 1.5rem;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.3s ease;
    }
    
    .btn-primary {
        background: #ff6b35;
        color: white;
    }
    
    .btn-primary:hover {
        background: #e55a2b;
    }
    
    .btn-secondary {
        background: #333;
        color: white;
    }
    
    .btn-secondary:hover {
        background: #444;
    }
    
    @media (max-width: 768px) {
        .access-notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
        }
        
        .access-payment-modal {
            width: 95%;
            margin: 1rem;
        }
        
        .payment-info {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        
        .amount-buttons {
            grid-template-columns: 1fr;
        }
        
        .modal-footer {
            flex-direction: column;
        }
    }
`;

document.head.appendChild(accessStyles);

console.log('💳 GENESIS PLATFORM ACCESS loaded');
