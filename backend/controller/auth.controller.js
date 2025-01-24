export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    res.send("Signup route");
};
export const login = async (req, res) => {
    res.send("login route");
};
export const logout = async (req, res) => {
    res.send("logout route");
};
