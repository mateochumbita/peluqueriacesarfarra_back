// tests/unit/utils/formatDateLatam.test.js

import { formaDateLatam } from "../../../../utils/formatDateLatam.js";

describe("formaDateLatam", () => {
  it("debería convertir una fecha ISO (YYYY-MM-DD) a formato DD/MM/YYYY", () => {
    expect(formaDateLatam("2024-06-20")).toBe("20/06/2024");
    expect(formaDateLatam("1999-12-01")).toBe("01/12/1999");
  });

  it("debería retornar null si no se pasa fecha o es null", () => {
    expect(formaDateLatam(null)).toBeNull();
    expect(formaDateLatam(undefined)).toBeNull();
    expect(formaDateLatam("")).toBeNull();
  });

  it("debería retornar la fecha original si el formato no es válido", () => {
    expect(formaDateLatam("20240620")).toBe("20240620"); // sin guiones
    expect(formaDateLatam("20/06/2024")).toBe("20/06/2024"); // ya está en otro formato
    expect(formaDateLatam("2024-06")).toBe("2024-06"); // incompleto
  });
});
