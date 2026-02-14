class GlobalValidations {
  static async checkNetConnection(): Promise<boolean> {
    try {
      return !!window.navigator.onLine;
    } catch {
      return false;
    }
  }
}
export default GlobalValidations;
