const numbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
console.log(numbers);

// [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

const double = (num: number): void => {
    console.log(num * 2);
};

numbers.forEach(double);

// 0
// 20
// 40
// 60
// 80
// 100
// 120
// 140
// 160
// 180

const names = ["Alice", "Bob", "Carol"];
const callMember = (name: string, id: number) => {
    return {
        id: id,
        name: name,
    };
};
const users = names.map(callMember);
console.log(users);

// [
//     { id: 0, name: "Alice" },
//     { id: 1, name: "Bob" },
//     { id: 2, name: "Carol" },
// ];

const evenIdUsers = users.filter((user) => {
    return user.id % 2 === 0;
});

console.log(evenIdUsers);

const isOdd = (user: { id: number; name: string }) => {
    return user.id % 2 === 1;
};
// const oddIdUsers = users.filter((user) => user.id % 2 === 1);
const oddIdUsers = users.filter(isOdd);
console.log(oddIdUsers);

const sum = numbers.reduce((previus, current) => previus + current, 0);
console.log(sum);
