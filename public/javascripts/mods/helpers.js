import Listeners from './listeners.js';

export default class Helpers {
  init(bool, currentButton, elements) {
    this.elements = elements;
    this.currentButton = currentButton;
    let list = new Listeners(this.elements, this);
    list.init();
    this.bool = bool;
  }

  showMessage() {
    this.elements.newMessage.classList.add('show');
  }

  resetFilterValues() {
    this.elements.nameElement.value = '';
    this.elements.searchTags.value = '';
  }

  formatFormData(obj, formData) {
    for (let entry of formData.entries()) {
      if (entry[0] === 'full_name' && entry[1]) {
        obj[entry[0]] = entry[1].trim().split(/\s+/).map(el => el[0].toUpperCase() + el.slice(1)).join(' ');
      } else if (entry[0] === 'phone_number' && entry[1]) {
        obj[entry[0]] = entry[1].trim();
      } else {
        obj[entry[0]] = entry[1];
      }
    }
  }

  format(number) {
    if (number.match(/\d{3}-\d{3}-\d{4}/)) {
      return number;
    } else if (number.match(/^\(\d{3}\)\d{3}-\d{4}$/)) {
      return number.replace('(', '').replace(')', '-');
    } else if (number.match(/\d{10}/)) {
      let arr = number.split('');
      arr.splice(3, 0, '-');
      arr.splice(7, 0, '-');
      return arr.join('');
    }
    return number;
  }

  deleteMessage() {
    this.elements.newMessage.classList.remove('show');
  }

  addHide(form) {
    this.deleteMessage();
    this.elements.newMessage.textContent = '';
    this.elements.searchForm.forEach(el => {
      el.style.display = 'none';
    });
    document.getElementById(form).style.display = 'block';
    document.getElementById("contact-handle").style.display = 'none';
    this.elements.contactAdd.style.display = 'none';
    this.elements.noContacts.style.display = 'none';
    this.resetFilterValues();
  }

  setTags(element, num, arr) {
    if (element.value === arr[num]) {
      element.setAttribute('selected', 'selected');
    } else {
      element.removeAttribute('selected');
    }
  }

  getTags(obj, one, two) {
    let tags = null;
    if (obj[one] && !obj[two]) {
      tags = obj[one];
    } else if (obj[two] && !obj[one]) {
      tags = obj[two];
    } else if (obj[one] && obj[two]) {
      tags = obj[one] + ',' + obj[two];
    }
    delete obj[one];
    delete obj[two];
    obj.tags = tags;
  }

  validate(obj, nameError, emailError, phoneError) {
    validation(obj.full_name, "^[a-zA-Z' -]+$", nameError);
    validation(obj.email, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$", emailError);
    validation(obj.phone_number, "^(\\d{10}|\\d{3}-\\d{3}-\\d{4}|\\(\\d{3}\\)\\d{3}-\\d{4})$", phoneError);

    function validation(key, regex, id) {
      let el = document.getElementById(id);
      let newRegex = new RegExp(regex);
      if (!key.match(newRegex)) {
        el.style.display = 'block';
        el.previousElementSibling.classList.add('errorbox');
      } else {
        el.style.display = 'none';
        el.previousElementSibling.classList.remove('errorbox');
      }
    }
  }

  hideForm() {
    document.getElementById("submissionForm").style.display = 'none';
    this.elements.searchForm.forEach(el => {
      el.style.display = 'block';
    });
    document.getElementById("contact-handle").style.display = 'block';
  }

  clearErrors() {
    this.elements.error.forEach(err => {
      err.style.display = 'none';
    });
    Array.prototype.slice.call(document.getElementsByClassName('errorbox')).forEach(el => el.classList.remove('errorbox'));
  }

  notification(searchName, searchTag, phrase) {
    let search = document.getElementById('search');

    if (Array.prototype.slice.call((document.querySelectorAll('ul'))).every(ul => ul.style.display === 'none')) {
      this.elements.noContacts.style.display = 'block';
      search.textContent = (searchName.length > 0 && searchTag.length > 0) ? `starting with ${searchName} with the Tag: ${searchTag}` : phrase;
    } else {
      this.elements.noContacts.style.display = 'none';
    }
    if (searchTag === '' && searchName === '') this.elements.noContacts.style.display = 'none';
  }
}