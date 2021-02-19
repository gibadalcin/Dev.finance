const Modal = {
    open() {
        //abrir modal
        //adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close() {
        //fechar o modal
        //remover a class active do modal
        document   
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

const Modal_date = {
    
    open() {
       
        //abrir modal
        //adicionar a class active ao modal
        document
            .querySelector('.modal_date')
            .classList
            .add('active')
            
    },

    close() {
        //fechar o modal
        //remover a class active do modal
        document   
            .querySelector('.modal_date')
            .classList
            .remove('active')
    },
}

const Storage = {
    get() {
       return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index,1)

        App.reload()
    },

    incomes() {
        let income = 0;
        //pegar todas as transações
        //para cada transação,
        Transaction.all.forEach(transaction => {
            //se ela for maior que zero
            if(transaction.amount > 0) {
                //somar a uma variável e retornar a variável
                income += transaction.amount;
            }
        }) 
        return income;
    },

    expenses() {
        let expense = 0;
        //pegar todas as transações
        //para cada transação,
        Transaction.all.forEach(transaction => {
            //se ela for menor que zero
            if(transaction.amount < 0) {
                //somar a uma variável e retornar a variável
                expense += transaction.amount;
            }
        }) 
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
} 

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" :
        "expense"
        const amount = Utils.formatCurrency(transaction.amount)
        const html = 
    `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick = "Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
    `
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }

}

const Utils = {
    formatAmount(value) {
       //value = Number(value.replace(/\,\./g, ""))*100

        value = Number(value)*100
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    format_initial_date(initial_date) {
        const splittedDate = initial_date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    format_final_date(final_date) {
        const splittedDate = final_date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\,\./g, "")
        value = Number(value) /100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return  value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },

   validateFields() {
        const {description,amount,date } = this.getValues()
        if(description.trim() === "" || 
                amount.trim() === "" || 
                  date.trim() === "" ){
                      throw new Error("teste")
                  }
    },

    formatValues() {
        let {description,amount,date } = this.getValues()
            amount = Utils.formatAmount(amount)
              date = Utils.formatDate(date)
        return {
            description,
            amount,
            date  
        }        
    },

    clearFields() {
        this.description.value = ""
        this.amount.value = ""
        this.date.value = ""
    },

    submit(event) {
        event.preventDefault()
            try{
                DOM.clearTransactions()
                //verificar se todas as informações foram preenchidas
                this.validateFields()
                //formatar os dados para salvar
                const transaction = this.formatValues()
                //salvar
                Transaction.add(transaction)
                //apagar os dados do formulário
                this.clearFields()
                //modal feche
                Modal.close()
            }catch(error) {
                alert(error.message)
            } 
    }
}

const Form_dates = {
    final_date: document.querySelector('input#final_date'),
    initial_date: document.querySelector('input#initial_date'),
    
    getValues() {
            
        return {
            initial_date: this.initial_date.value,
            final_date: this.final_date.value,
        }
    },
        
    validate_date() {

        const { initial_date, final_date } = this.getValues()

            if(initial_date.trim() === "", final_date.trim() === ""  ) { 

                throw new Error("Por favor digite a data do período da busca!")
            }
    },

    format_date() {
        
        let { initial_date, final_date} = this.getValues()

                initial_date = Utils.format_initial_date(initial_date)
                final_date = Utils.format_final_date(final_date)

            return {
                initial_date,
                final_date,  
            }        
        },

    clearField_date() {

            this.initial_date.value = ""
            this.final_date.value = ""
    },
        
    show_incomes() {   
        DOM.clearTransactions()     

        let incomes = Storage.get()
        let incomes_period = this.format_date()

        incomes.forEach(function(income) {    
            if(income.amount > 0) {

                if(income.date >= incomes_period.initial_date && income.date <= incomes_period.final_date) {
                    DOM.addTransaction(income)         
                }
                else if (incomes_period.initial_date == 'undefined/undefined/' || incomes_period.final_date == 'undefined/undefined/'){
                    DOM.addTransaction(income)
                 }
            }
        });   
    },

    show_expenses() {
        DOM.clearTransactions()

        let expenses = Storage.get()
        let expenses_period = this.format_date()
        
        expenses.forEach(function(expense)  {  
            if(expense.amount < 0) {

                if(expense.date >= expenses_period.initial_date && expense.date <= expenses_period.final_date) {
                    DOM.addTransaction(expense)
                }  
                else if (expenses_period.initial_date == 'undefined/undefined/' || expenses_period.final_date == 'undefined/undefined/'){
                    DOM.addTransaction(expense)
                } 
            }  
        });
    },

    show_all_transactions() {
        DOM.clearTransactions()
        let all_transactions = Storage.get()
        let all_period = Form_dates.format_date()

        all_transactions.forEach(function(all) {

            if(all.date >= all_period.initial_date && all.date <= all_period.final_date) {   
                DOM.addTransaction(all)
            }
        });
    },

    submit_date(event) {

        event.preventDefault()

            try{
                DOM.clearTransactions()

                this.validate_date()
                this.format_date()               
                this.show_incomes()                   
                this.show_expenses()
                this.show_all_transactions() 

                Modal_date.close() 

            }catch(error) {
                alert(error.message)
            } 
    },   
}

const App = {
    init() {
        /*
        Transaction.all.forEach(function(transaction, index) { ou
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction)
        }) ou
        */
        Transaction.all.forEach(DOM.addTransaction) 
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        Form_dates.clearField_date()
        App.init()
    }
}

 function reload_ap() {
     App.reload()
 } 

App.init()
    

    

    
    
   



