const books= [];
const RENDER_EVENT = 'render_bookshelf';
const bookListUndone = 'uncompletedBook';
const bookListDone = 'completedBook';
const deleteButton = document.getElementById('hapus');
const closeModal = document.getElementById('close');
const modal = document.querySelector('#modal')

document.addEventListener('DOMContentLoaded', function(){
    const saveForm = document.getElementById('form-bookshelf');
    saveForm.addEventListener('submit', function(e) {
        e.preventDefault();
        modal.classList.remove("modal-open");
        addBook();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
});

function addBook(){
    const uncompletedBook = document.getElementById('bookListUndone');
    const completedBook = document.getElementById('bookListDone');

    const generatedID = generateID();
    const judul = document.getElementById('title').value;
    const penulis = document.getElementById('author').value;
    const tahun = document.getElementById('year').value;
    const selesai = document.getElementById('isCompleted').checked;

    const bookshelfObject = generateBookShelfObject(generatedID, judul, penulis, tahun, selesai);
    const book = newBook(bookshelfObject);
    books.push(bookshelfObject);


    if (selesai==false){
        uncompletedBook.append(book);
    } else {
        completedBook.append(book);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateID(){
    return +new Date();
}

function generateBookShelfObject(id, title, author, year, isCompleted){
    return {
        id,
        title, 
        author, 
        year: parseInt(year),
        isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function(){
    const uncompletedBook = document.getElementById('bookListUndone')
    uncompletedBook.innerHTML = '';

    const completedBook = document.getElementById('bookListDone');
    completedBook.innerHTML = '';

    for (const bookItem of books){
        const bookitemList = newBook(bookItem);
        if(!bookItem.isCompleted){
            uncompletedBook.append(bookitemList);
        } else {
            completedBook.append(bookitemList);
        }
    }

    console.log(books);
    booksLength();
});

function newBook (bookShelfObject) {
    const judulBuku = document.createElement('h3');
    judulBuku.innerText = bookShelfObject.title;
    judulBuku.classList.add('pindah');

    const penulisBuku = document.createElement('p');
    penulisBuku.innerText = `Penulis : ${bookShelfObject.author}`;

    const tahunBuku = document.createElement('p');
    tahunBuku.innerText = `Tahun : ${bookShelfObject.year}`;

    //Bikin isi dari box buku list
    const bookItem = document.createElement('article')
    bookItem.classList.add('bookItem');
    bookItem.append(judulBuku, penulisBuku, tahunBuku);

    //Bikin box untuk buku list
    const bookList = document.createElement('div');
    bookList.classList.add('bookListItem');
    bookList.append(bookItem);
    bookList.setAttribute('id', 'book-${bookShelfObject.id}');

    if (bookShelfObject.isCompleted) {
        const trashButton = document.createElement('button');
        trashButton.innerText='Hapus';
        trashButton.classList.add('red-modal');

        trashButton.addEventListener('click', function(){
            modal.classList.toggle("modal-open");
            dialogRemove(bookShelfObject);

        });

        const moveButton = document.createElement('button');
        moveButton.innerText='Belum Selesai';
        moveButton.classList.add('button','green');

        moveButton.addEventListener('click', function(){
            moveBookFromCompleted(bookShelfObject.id);
        });

        bookList.append(trashButton, moveButton);
    } else {
        const trashButton = document.createElement('button');
        trashButton.innerText='Hapus';
        trashButton.classList.add('button', 'red');

        trashButton.addEventListener('click', function(){
            modal.classList.toggle("modal-open");
            dialogRemove(bookShelfObject);

        });
        
        const moveButtonUncompleted = document.createElement('button');
        moveButtonUncompleted.innerText='Sudah Selesai';
        moveButtonUncompleted.classList.add('button', 'green');

        moveButtonUncompleted.addEventListener('click', function(){
            moveBookFromUnCompleted(bookShelfObject.id);
        });

        bookList.append(trashButton, moveButtonUncompleted);
    }

    return bookList;

}

//function modal
function dialogRemove (bookShelfObject) {

    deleteButton.addEventListener("click", ()=>{
        removeBookItem(bookShelfObject.id);
        modal.classList.remove("modal-open");
    });

    closeModal.addEventListener("click",()=>{
        modal.style.trasition = '1s';
        modal.classList.remove("modal-open")
    });    

}

//function crud buku
function removeBookItem(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));


    saveData();
}

function moveBookFromCompleted(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function moveBookFromUnCompleted(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    } 

    return -1;
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

//Melihat jumlah buku
const booksLength = () => {
    const totalBuku = document.getElementById('totalBuku');
    totalBuku.innerText = books.length;
  }

//fitur search
document.getElementById('searchSubmit').addEventListener("click", function (event){
    event.preventDefault();
    const searchBook = document.getElementById('searchByTitle').value.toLowerCase();
    const bookList = document.querySelectorAll('.bookItem > h3');
        for (const buku of bookList) {
            if (buku.innerText.toLowerCase().includes(searchBook)) {
                buku.parentElement.parentElement.style.display = "block";
              }
            else if (searchBook !== buku.innerText.toLowerCase()) {
                buku.parentElement.parentElement.style.display = "none";
            } else {
                buku.parentElement.parentElement.style.display = "block";
            }
        }
});


//function untuk mengubah teks pada button 
function ubahText(){
    const checkbox = document.getElementById("isCompleted");
    const textButton = document.getElementById("textButton");

    if(checkbox.checked == true) {
        textButton.innerText = "Sudah selesai";
    }else{
        textButton.innerText = "Belum selesai";
    }
};

//Memanfaatkan Local Storage
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_SHELF';

function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist(){
    if (typeof (Storage) === undefined) {
      alert('Maaf Browser Anda tidak Mendukung Local Storage');
      return false;
    }
    return true;
  }

  document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const localdata = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(localdata);
    
    if (data !== null) {
        for (const book of data) {
        books.push(book);
        }
    }
    
    document.dispatchEvent(new Event(RENDER_EVENT));
}
