async function checkAuthStatus() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/verificar-token`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Status de autenticação:", data);
      return data;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return false;
  }
}

function createNav(userRole) {
  return `
  <ul class="nav-links">
    <li>
      <a href="index.html"><i class="fas fa-home"></i> Página Inicial</a>
    </li>
    <li id="create-post-link" style="display: ${userRole === "ALUNO" ? "none" : "block"};">
      <a href="criarPostagem.html"><i class="fas fa-pencil-alt"></i> Criar Postagem</a>
    </li>
    <li>
      <a href="servicos.html"><i class="fas fa-cogs"></i> Serviços</a>
    </li>
    <li>
      <a href="suporte.html"><i class="fas fa-headset"></i> Suporte</a>
    </li>
  </ul> `;
}

async function protectRoutes() {
  const currentPath = window.location.pathname;

  const publicPages = ["/login.html", "/loginCoordenacao.html", "/loginAluno.html", "/loginProfessor.html"];

  const isPublicPage = publicPages.some((page) => currentPath.includes(page));

  const data = await checkAuthStatus();

  if (data.authenticated) {
    if (isPublicPage) {
      window.location.href = "/index.html";
    }

    document.getElementById("navbar-container").innerHTML = createNav(data.user.role);

    if (data.user.role === "ALUNO") {
      if (currentPath.includes("/criarPostagem.html")) return window.location.href = "/index.html";
    } 
  } else {
    if (!isPublicPage) {
      window.location.href = "/login.html";
    }
  }
}

window.addEventListener("load", async () => {
  await protectRoutes();
});

document.querySelector(".login-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const errorContainer = document.getElementById("errorContainer");

  const formData = new FormData(event.target);
  formData.append("email", document.getElementById("username").value);
  formData.append("senha", document.getElementById("password").value);

  fetch(`${CONFIG.API_URL}/login`, {
    method: "POST",
    body: JSON.stringify({
      email: formData.get("email"),
      senha: formData.get("senha"),
    }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (response) => {
    if (!response.ok) {
      const data = await response.json();
      errorContainer.innerHTML = "";

      if (data.errors) {
        data.errors.map((error) => (errorContainer.innerHTML += `<p class="error-message">${error}</p>`));
      } else {
        errorContainer.innerHTML = `<p class="error-message">${data.message}</p>`;
      }
    } else {
      window.location.href = "/index.html";
    }
  });

  login();
});
