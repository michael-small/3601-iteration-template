export interface TestUser {
  name: string;
  age: string;
  company?: string;
  email?: string;
  role: 'admin' | 'editor' | 'viewer';
}

export class AddUserPage {
  navigateTo() {
    return cy.visit('/users/new');
  }

  getTitle() {
    return cy.get('.add-user-title');
  }

  addUserButton() {
    return cy.contains('button', 'ADD USER');
  }

  typeInput(inputId: string, text: string) {
    const input = cy.get(`#${inputId}`).click();
    input.type(text);
  }

  selectMatSelectValue(selectID: string, value: string) {
    const sel = cy.get(`#${selectID}`).click().get(`mat-option[value="${value}"]`).click();
  }

  addUser(newUser: TestUser) {
    this.typeInput('nameField', newUser.name);
    this.typeInput('ageField', newUser.age);
    if (newUser.company) {
      this.typeInput('companyField', newUser.company);
    }
    if (newUser.email) {
      this.typeInput('emailField', newUser.email);
    }
    this.selectMatSelectValue('roleField', newUser.role);
    return this.addUserButton().click();
  }

  checkSnackbar(newUserName: string) {
    cy.get('.mat-simple-snackbar').invoke('text').should('eq', `Added User ${newUserName}`);
  }
}
