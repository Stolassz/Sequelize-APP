describe("Testando a área de cadastro", () => (
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.visit('/');
    }),

    it("exibe erro quando as senhas do cadastro não conferem", () => {
        cy.contains('Criar conta').click();
        
        cy.get('input[type="email"]').type("teste@teste.com");
        cy.get('input[type="password"]').eq(0).type("senha123");
        cy.get('input[type="password"]').eq(1).type("senha1234");
        
        cy.contains('Criar minha conta').click();

        // Área que aciona a verificação
        cy.contains("As senhas não conferem.").should("be.visible");
    }),

    it("avança para a verificação de email", () => {
        cy.contains('Criar conta').click();
        
        cy.get('input[type="email"]').type("teste@teste.com");  
        cy.get('input[type="password"]').eq(0).type("senha-123");
        cy.get('input[type="password"]').eq(1).type("senha-123");
        
        cy.contains('Criar minha conta').click();

        // 
        cy.contains("Enviamos um código para teste@teste.com").should("be.visible");
    })
));